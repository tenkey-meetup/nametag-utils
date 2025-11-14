import type { Participant } from "@/typedefs/CsvTypes";
import type { Component } from "solid-js";
import { GenericBlankCard } from "./GenericBlankCard";

export const ParticipantCard: Component<{
  participant: Participant,
}> = (props) => {

  return (
    <GenericBlankCard>
      <h2 class="font-semibold text-xl">{props.participant.displayName}</h2>
      <div>
        <p>ユーザー名：{props.participant.username}</p>
        <p>受付番号：{props.participant.registrationId}</p>
      </div>
    </GenericBlankCard>
  )
}