import { getProfile, getUsage, handle, isAdminEmail, ok, requireUser } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireUser(req);
    const profile = await getProfile(user);
    return ok({
      user: {
        id: profile.id,
        username: profile.email.split("@")[0],
        email: profile.email,
        fullName: profile.full_name,
        role: profile.skill,
        phone: profile.phone,
        isAdmin: isAdminEmail(profile.email || user.email),
      },
      usage: await getUsage(profile),
    });
  });
}
