import { debounce } from "@solid-primitives/scheduled";
import { IdCard } from "lucide-solid"
import { createEffect, createSignal, onMount, type Component } from "solid-js"
import { autofocus } from "@solid-primitives/autofocus";


export const ExternalBarcodeReaderInput: Component<{
  onInput: (id: string) => void
}> = (props) => {

  const [inputText, setInputText] = createSignal<string>("")
  // const trigger = debounce((message: string) => console.log(message), 250);


  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      props.onInput(inputText())
      setInputText("")
    }
    else if (e.key === "Delete") {
      e.preventDefault()
      setInputText("")
    }
  }

  return (
    <label class="input">
      <IdCard />
      <input autofocus type="search" class="grow" placeholder="受付番号を入力"
        use:autofocus
        onKeyDown={(e) => keyHandler(e)}
        onInput={(e) => setInputText(e.target.value)}
        value={inputText()}
      />
      <kbd class="kbd kbd-sm">↵</kbd>
    </label>
  )
}