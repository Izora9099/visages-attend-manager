import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-md group-[.toaster]:bg-surface group-[.toaster]:text-ink group-[.toaster]:border-hairline group-[.toaster]:shadow-md group-[.toaster]:font-sans",
          description: "group-[.toast]:text-ink-muted",
          success: "[&_[data-icon]]:text-present",
          error: "[&_[data-icon]]:text-absent",
          warning: "[&_[data-icon]]:text-late",
          info: "[&_[data-icon]]:text-signal",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
