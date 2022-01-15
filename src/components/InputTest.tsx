import { FormEvent, useEffect, useRef } from "react"

export default function InputTest() {
    const ref = useRef<HTMLInputElement>(null!)

    const handleInput = (e: FormEvent<HTMLInputElement>) => {
        console.log(e)
    }

    return (
        <input ref={ref} type='file' name="upload" placeholder="image upload" onInput={handleInput} />
    )
}