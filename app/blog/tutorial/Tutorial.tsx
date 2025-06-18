import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function Tutorial() {
  const MarkdownExample = ({
    title,
    example,
    preview,
    className = ""
  }: {
    title: string;
    example: string;
    preview: string;
    className?: string;
  }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="group relative">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-primary">{title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Button>
        </div>
        <div className="bg-muted p-2 rounded-md">
          <code className="text-xs font-mono">{example}</code>
        </div>
        <div className="mt-1">
          <span className="text-xs text-muted-foreground">Preview: </span>
          <span className={className}>{preview}</span>
        </div>
      </div>
    );
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className='my-2'><QuestionMarkCircledIcon/> Learn how to write a blog post</Button>
      </SheetTrigger>
      <SheetContent className="p-0 flex flex-col overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Learn how to write a blog post</SheetTitle>

        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full p-6">
            <div className="space-y-8">
              {/* Headers Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Headers</h3>
                <div className="space-y-4">
                  <MarkdownExample
                    title="Title (H1)"
                    example="# Title"
                    preview="Title"
                    className="text-2xl font-bold"
                  />
                  <MarkdownExample
                    title="Heading (H2)"
                    example="## Heading"
                    preview="Heading"
                    className="text-xl font-semibold"
                  />
                  <MarkdownExample
                    title="Subheading (H3)"
                    example="### Subheading"
                    preview="Subheading"
                    className="text-lg font-medium"
                  />
                </div>
              </div>

              {/* Text Formatting */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Text Formatting</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MarkdownExample
                    title="Bold"
                    example="**bold text**"
                    preview="bold text"
                    className="font-bold"
                  />
                  <MarkdownExample
                    title="Italic"
                    example="*italic text*"
                    preview="italic text"
                    className="italic"
                  />
                  <MarkdownExample
                    title="Strikethrough"
                    example="~~strikethrough~~"
                    preview="strikethrough"
                    className="line-through"
                  />
                  <MarkdownExample
                    title="Bold & Italic"
                    example="***bold & italic***"
                    preview="bold & italic"
                    className="font-bold italic"
                  />
                </div>
              </div>

              {/* Lists */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Lists</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-primary mb-2">Unordered List</h4>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm">- Item 1<br />- Item 2<br />  - Nested item</pre>
                    </div>
                    <ul className="mt-2 pl-5 list-disc">
                      <li>Item 1</li>
                      <li>Item 2
                        <ul className="pl-5 list-disc">
                          <li>Nested item</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-2">Ordered List</h4>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm">1. First item<br />2. Second item<br />   - Nested item</pre>
                    </div>
                    <ol className="mt-2 pl-5 list-decimal">
                      <li>First item</li>
                      <li>Second item
                        <ul className="pl-5 list-disc">
                          <li>Nested item</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Links & Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Links & Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MarkdownExample
                    title="Link"
                    example="[Example](https://example.com)"
                    preview="Example"
                    className="text-blue-600 hover:underline"
                  />
                  <MarkdownExample
                    title="Image"
                    example="![Alt text](/image.jpg)"
                    preview="[Image: Alt text]"
                    className="text-sm text-muted-foreground"
                  />
                </div>
              </div>

              {/* Code & Blocks */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Code & Blocks</h3>
                <div className="space-y-4">
                  <MarkdownExample
                    title="Inline Code"
                    example="`code`"
                    preview="code"
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  />
                  <div>
                    <h4 className="font-medium text-primary mb-2">Code Block</h4>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm">
                        {`\`\`\`javascript
function hello() {
  console.log('Hello!');
}
\`\`\``}
                      </pre>
                    </div>
                  </div>
                  <MarkdownExample
                    title="Blockquote"
                    example="> Blockquote text"
                    preview="Blockquote text"
                    className="border-l-4 border-muted-foreground pl-4 text-muted-foreground"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Horizontal Rule</h4>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm">---</pre>
                </div>
                <div className="border-t my-2"></div>
              </div>
            </div>
            {/* Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary pt-2">Table</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm">
                  {`| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`}
                </pre>
              </div>
              <SheetDescription>
                Click Publish when you're done.
              </SheetDescription>
            </div>
          </ScrollArea>
        </div>
        <SheetFooter className="p-4 border-t">
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
