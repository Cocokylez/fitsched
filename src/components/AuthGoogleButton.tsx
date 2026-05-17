"use client"

import Image from "next/image"
import { signIn } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { isGoogleAuthAvailable } from "@/services/authProviders"

interface AuthGoogleButtonProps {
  label: string
  callbackPath?: string
}

/**
 * Starts Google auth in a popup and completes sign-in without replacing the main page.
 *
 * @param props - Button label and post-login callback path.
 * @returns The Google auth button and any safe auth-start error message.
 */
export function AuthGoogleButton({
  label,
  callbackPath = "/schedule",
}: AuthGoogleButtonProps) {
  const popupRef = useRef<Window | null>(null)
  const closeCheckRef = useRef<number | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)
  const [checkingGoogle, setCheckingGoogle] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const loadProviders = async () => {
      try {
        const available = await isGoogleAuthAvailable()
        if (mounted) setGoogleAvailable(available)
      } catch {}
      finally {
        if (mounted) setCheckingGoogle(false)
      }
    }

    loadProviders()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== "fitsched:google-auth-complete") return

      setWaiting(false)
      if (closeCheckRef.current) window.clearInterval(closeCheckRef.current)
      popupRef.current?.close()
      window.location.assign(event.data.next || callbackPath)
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
      if (closeCheckRef.current) window.clearInterval(closeCheckRef.current)
    }
  }, [callbackPath])

  const startGooglePopup = async () => {
    if (!googleAvailable || checkingGoogle || waiting) return

    setError("")
    setWaiting(true)

    const completeUrl = new URL("/auth/popup-complete", window.location.origin)
    completeUrl.searchParams.set("next", callbackPath)
    const width = 460
    const height = 640
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2)
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2)

    const popup = window.open(
      "",
      "fitsched-google-login",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )

    if (!popup) {
      await signIn("google", { redirectTo: completeUrl.toString() })
      return
    }

    popupRef.current = popup
    popup.document.write(`
      <!doctype html>
      <title>FitSched</title>
      <body style="margin:0;background:#171717;color:#f4f4f4;font-family:system-ui;display:grid;min-height:100vh;place-items:center;text-align:center">
        <div>
          <div style="font-size:20px;font-weight:800;margin-bottom:8px">FitSched</div>
          <div style="font-size:13px;color:#9ca3af">Opening Google sign in...</div>
        </div>
      </body>
    `)
    popup.focus()

    try {
      const result = await signIn("google", {
        redirect: false,
        redirectTo: completeUrl.toString(),
      })

      if (result?.url) {
        popup.location.href = result.url
      } else {
        popup.close()
        setWaiting(false)
        setError("Google sign in could not start.")
        return
      }
    } catch {
      popup.close()
      setWaiting(false)
      setError("Google sign in could not start.")
      return
    }

    if (closeCheckRef.current) window.clearInterval(closeCheckRef.current)
    closeCheckRef.current = window.setInterval(() => {
      if (popup.closed) {
        setWaiting(false)
        if (closeCheckRef.current) window.clearInterval(closeCheckRef.current)
      }
    }, 500)
  }

  return (
    <>
      <button
        type="button"
        onClick={startGooglePopup}
        disabled={waiting || checkingGoogle || !googleAvailable}
        className={`motion-lift mb-5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-bold text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
          waiting || checkingGoogle || !googleAvailable ? "cursor-default opacity-70" : "cursor-pointer opacity-100"
        }`}
      >
        <Image src="/google.svg" width={16} height={16} alt="Google" />
        {checkingGoogle ? "Checking Google..." : !googleAvailable ? "Google sign in unavailable" : waiting ? "Waiting for Google..." : label}
      </button>
      {error && (
        <div className="-mt-3.5 mb-4 text-center text-xs text-[#ff6666]">
          {error}
        </div>
      )}
    </>
  )
}
