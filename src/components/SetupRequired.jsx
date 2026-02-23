/**
 * Shown when Supabase env vars are missing. Explains how to enable cloud sync.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cloud sync not configured</CardTitle>
          <CardDescription>
            To use this app on multiple devices, set up a free Supabase project and add your keys.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ol className="list-decimal space-y-2 pl-4">
            <li>Create a project at <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">app.supabase.com</a>.</li>
            <li>In the project: Settings → API, copy <strong>Project URL</strong> and <strong>anon public</strong> key.</li>
            <li>In this app folder, copy <code className="rounded bg-muted px-1">.env.example</code> to <code className="rounded bg-muted px-1">.env</code> and paste the values.</li>
            <li>In Supabase: SQL Editor, run the script in <code className="rounded bg-muted px-1">supabase/schema.sql</code> to create the expenses table.</li>
            <li>Restart the dev server and reload this page.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
