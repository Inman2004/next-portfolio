import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image"
import { awards } from "./Testimonials";
import { PictureInPicture2 } from "lucide-react";

interface CertificatePopoverProps {
  index: number;
}

export function PopoverDemo({ index }: CertificatePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="mt-auto inline-flex items-center text-sm font-medium bg-transparent hover:bg-transparent border-none hover:border-none hover:ring-0 text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors group/link">
            View Certificate
            <PictureInPicture2 className="w-3.5 h-3.5 ml-1 transition-transform group-hover/link:tranzinc-y-[-1px]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] max-w-md p-0 overflow-hidden">
        <div className="relative aspect-[4/3] w-full">
          <Image 
            src={awards[index]?.img || ''} 
            alt={awards[index]?.name || 'Certificate'} 
            fill 
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 28rem"
          />
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900/80 dark:backdrop-blur-sm border-t">
          <h4 className="font-medium text-lg">{awards[index]?.name || 'Certificate'}</h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {awards[index]?.provider}
          </p>
          {awards[index]?.date && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Issued: {awards[index]?.date}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
