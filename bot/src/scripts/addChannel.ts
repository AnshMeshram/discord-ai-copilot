import "dotenv/config";
import { supabase } from "../lib/supabase";

async function main() {
  const channelId = process.argv[2];
  const serverId = process.argv[3];
  const channelName = process.argv[4] || null;

  if (!channelId || !serverId) {
    console.error(
      "Usage: tsx src/scripts/addChannel.ts <CHANNEL_ID> <SERVER_ID> [CHANNEL_NAME]"
    );
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("allowed_channels")
    .insert({
      channel_id: channelId,
      channel_name: channelName,
      server_id: serverId,
    })
    .select()
    .maybeSingle();

  if (error) {
    if ((error as any).code === "23505") {
      const { data: existing } = await supabase
        .from("allowed_channels")
        .select("*")
        .eq("channel_id", channelId)
        .eq("server_id", serverId)
        .maybeSingle();
      console.log("✅ Channel already allowed:", existing);
      process.exit(0);
    }
    console.error("❌ Failed to insert channel:", error);
    process.exit(1);
  }

  console.log("✅ Channel added:", data);
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
