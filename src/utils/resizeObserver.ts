import React, { useState, useEffect } from "react"

const useResizeObserver = (element: HTMLElement) => {
    const [properties, setSize] = useState({
        x: 0,
        y: 0,
        height: 0,
        width: 0
    })
    const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const {x, y, height, width} = entry.contentRect
            setSize({
                x,
                y,
                height,
                width
            })
        })
    })

    useEffect(() => {
        
        resizeObserver.observe(element)
        
        return () => resizeObserver.unobserve(element)
    }, [])

    return properties
}

export { useResizeObserver }