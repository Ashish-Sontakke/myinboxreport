export const USER_PROFILE_KEY = "myinboxreport_user"

/** True when a signed-in profile is stored — no network, no Google script. */
export function hasStoredProfile(): boolean {
  try {
    return !!localStorage.getItem(USER_PROFILE_KEY)
  } catch {
    return false
  }
}
