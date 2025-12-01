"use client";

export function AddressAvatar({
    address,
    size = 24,
}: {
    address: string;
    size?: number;
}) {
    // Generazione semplice di identicon SVG basato sull'indirizzo (seeded)
    const seed = Array.from(address.toLowerCase()).reduce(
        (acc, ch) => acc + ch.charCodeAt(0),
        0
    );
    function rnd(i: number) {
        let x = (seed + i * 9973) % 2147483647;
        x = (x * 48271) % 2147483647;
        return x / 2147483647;
    }
    const hue = Math.floor(rnd(1) * 360);
    const fg = `hsl(${hue}, 70%, 50%)`;
    const bg = `hsl(${(hue + 180) % 360}, 40%, 92%)`;
    const cells: boolean[] = [];
    for (let y = 0; y < 5; y++) {
        const row: boolean[] = [];
        for (let x = 0; x < 3; x++) {
            row.push(rnd(y * 5 + x) > 0.5);
        }
        // Specchia per ottenere 5 colonne
        cells.push(...row, row[1], row[0]);
    }
    const cellSize = size / 5;
    const rects = [] as any[];
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            const idx = y * 5 + x;
            rects.push({ x: x * cellSize, y: y * cellSize, on: cells[idx] });
        }
    }
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ borderRadius: "50%", background: bg }}
        >
            {rects.map((r, i) => (
                <rect
                    key={i}
                    x={r.x}
                    y={r.y}
                    width={cellSize}
                    height={cellSize}
                    fill={r.on ? fg : "transparent"}
                />
            ))}
        </svg>
    );
}
