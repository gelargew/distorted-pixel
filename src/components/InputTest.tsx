import { FormEvent, useEffect, useRef, useState } from "react"

export default function InputTest() {
    const ref = useRef<HTMLInputElement>(null!)
    const [image, setImage] = useState<string>('')

    const handleInput = (e: FormEvent<HTMLInputElement>) => {
        const files = (e.target as HTMLInputElement).files
        if (files) {
            const a = setImage(URL.createObjectURL(files[0]))
        }
    }

    return (
        <>
            <input ref={ref} type='file' onChange={handleInput} />
            <img src={image} />
        </>
        
    )
}