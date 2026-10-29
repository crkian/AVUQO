/** Buffer's current GraphQL API. Never import into client components. */
const ENDPOINT = "https://api.buffer.com";
export type BufferChannel = { id: string; name: string; service: string };
export type BufferPost = {
  id: string; channelId: string; status: string; text: string;
  metrics?: {type:string;name:string;value:number;unit:string}[];
  metricsUpdatedAt?: string|null;
};

export async function bufferGraphql<T>(
  query: string,
  variables: Record<string,unknown> = {},
  signal?: AbortSignal
): Promise<T> {
  const key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error("Buffer API key has not been configured");
  const response = await fetch(ENDPOINT,{
    method:"POST",
    headers:{"Authorization": "Bearer "+key,"Content-Type":"application/json"},
    body:JSON.stringify({query,variables}),
    signal: signal ?? AbortSignal.timeout(12000),
    cache:"no-store"
  });
  if (!response.ok) throw new Error("Buffer HTTP "+response.status);
  const parsed: {data?:T;errors?:{message:string}[]} = await response.json();
  if (parsed.errors?.length || !parsed.data) {
    throw new Error("Buffer rejected request: "+(parsed.errors?.[0]?.message??"Missing response"));
  }
  return parsed.data;
}

export async function listBufferChannels(): Promise<BufferChannel[]> {
  const account = await bufferGraphql<{account:{organizations:{id:string}[]}}>(
    "query Account { account { organizations { id } } }"
  );
  const all: BufferChannel[] = [];
  for (const org of account.account.organizations??[]) {
    const channels = await bufferGraphql<{channels:BufferChannel[]}>(
      "query Channels($input:ChannelsInput!) { channels(input:$input) { id name service } }",
      {input:{organizationId:org.id}}
    );
    all.push(...channels.channels);
  }
  return all;
}

export type BufferSchedule = {
  text: string; channelId: string; dueAt: string; imageUrl?: string; aiAssisted?: boolean;
};
export function buildBufferVariables(input: BufferSchedule) {
  if (!input.channelId.trim()) throw new Error("Missing channel ID");
  if (!Number.isFinite(Date.parse(input.dueAt))) throw new Error("Invalid scheduled time");
  if (!input.text.trim()) throw new Error("Empty post");
  if (input.imageUrl && (!input.imageUrl.startsWith("https://") || !URL.canParse(input.imageUrl))) {
    throw new Error("Media must have a public HTTPS URL");
  }
  return {input:{
    text:input.text, channelId:input.channelId,
    schedulingType:"automatic", mode:"customScheduled", dueAt:input.dueAt,
    needsApproval:false, saveToDraft:false,
    aiAssisted:!!input.aiAssisted,
    assets:input.imageUrl?[{image:{url:input.imageUrl}}]:[]
  }};
}
export async function scheduleBufferPost(input:BufferSchedule):Promise<{id:string}> {
  if (process.env.MARKETING_LIVE_PUBLISH !== "YES") {
    throw new Error("MARKETING_LIVE_PUBLISH is not YES");
  }
  const result = await bufferGraphql<{createPost:{
    post?:{id:string};message?:string;__typename:string
  }}>(
    "mutation CreatePost($input:CreatePostInput!) { createPost(input:$input) { __typename ... on PostActionSuccess { post { id } } ... on MutationError { message } } }",
    buildBufferVariables(input)
  );
  if (!result.createPost.post?.id) throw new Error(result.createPost.message??"Buffer did not acknowledge the post");
  return {id:result.createPost.post.id};
}
export async function getBufferPost(id:string):Promise<BufferPost> {
  const result = await bufferGraphql<{post:BufferPost}>(
    "query Post($input:PostInput!) { post(input:$input) { id channelId status text metrics { type name value unit } metricsUpdatedAt } }",
    {input:{id}}
  );
  return result.post;
}


/** Explicit owner request only. Never treat a timeout as confirmed cancellation. */
export async function deleteScheduledBufferPost(id:string):Promise<void> {
  if(process.env.MARKETING_LIVE_PUBLISH!=="YES") throw new Error("Publishing provider disabled");
  const state=await getBufferPost(id);
  if(state.status!=="scheduled"&&state.status!=="draft"&&state.status!=="needs_approval") {
    throw new Error("Provider post is not safely deletable");
  }
  const response=await bufferGraphql<{deletePost:{id?:string;message?:string;__typename:string}}>(
    "mutation Delete($input:DeletePostInput!) { deletePost(input:$input) { __typename ... on DeletePostSuccess { id } ... on VoidMutationError { message } } }",
    {input:{id}}
  );
  if(!response.deletePost.id) throw new Error(response.deletePost.message||"Buffer deletion not confirmed");
}
