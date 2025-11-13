
export type Participant = {
  registrationId: string
  username: string
  displayName: string
  connpassAttending: Boolean
}

export function isParticipant(input: any): input is Participant {
  return (
    typeof input.registrationId === "string" && 
    typeof input.username === "string" && 
    typeof input.displayName === "string" && 
    typeof input.connpassAttending === "boolean"
  )
}

export type RawParticipantsCsvEntry = {
  受付番号: string,
  ユーザー名: string,
  表示名: string,
  参加ステータス: "参加" | "参加キャンセル"
}

export function isValidRawParticipantsCsvEntry(input: any): input is RawParticipantsCsvEntry {
  return (
    typeof input.受付番号 === "string" && 
    typeof input.ユーザー名 === "string" && 
    typeof input.表示名 === "string" && 
    (input.参加ステータス === "参加" || input.参加ステータス === "参加キャンセル")
  )
}