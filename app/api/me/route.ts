import { getProfile, getUsage, handle, ok, requireUser } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

/** Profil & pemakaian paket akun yang sedang masuk. */
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
      },
      usage: await getUsage(profile),
    });
  });
}
