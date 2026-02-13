import { useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Printer } from 'lucide-react'

interface BarcodeDisplayProps {
  barcode: string
  phoneModel?: string
  className?: string
}

export function BarcodeDisplay({
  barcode,
  phoneModel,
  className,
}: BarcodeDisplayProps) {
  const printAreaRef = useRef<HTMLDivElement>(null)

  const handlePrint = useCallback(() => {
    const printContent = printAreaRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode - ${barcode}</title>
          <style>
            @media print {
              @page {
                size: 80mm 40mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 10px;
                font-family: Arial, sans-serif;
              }
            }
            .barcode-container {
              text-align: center;
            }
            .barcode-svg {
              width: 100%;
              height: auto;
              max-width: 200px;
            }
            .barcode-text {
              margin-top: 5px;
              font-size: 14px;
              font-weight: bold;
            }
            .phone-model {
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }, [barcode])

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div ref={printAreaRef} className="barcode-container">
          <svg className="barcode-svg mx-auto" height="60">
            <BarcodeGraphic barcode={barcode} />
          </svg>
          <div className="barcode-text mt-2">{barcode}</div>
          {phoneModel && <div className="phone-model">{phoneModel}</div>}
        </div>
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Barcode
        </Button>
      </CardContent>
    </Card>
  )
}

function BarcodeGraphic({ barcode }: { barcode: string }) {
  const bars: number[] = []

  for (let i = 0; i < barcode.length; i++) {
    const charCode = barcode.charCodeAt(i)
    bars.push(charCode % 2 === 0 ? 1 : 0)
    bars.push(1)
  }

  return (
    <g>
      {bars.map((bar, index) => (
        <rect
          key={index}
          x={index * 3}
          y="0"
          width="2"
          height="60"
          fill={bar === 1 ? 'black' : 'white'}
        />
      ))}
    </g>
  )
}
