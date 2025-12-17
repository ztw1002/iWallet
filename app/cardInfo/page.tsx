import { createClient } from '@/lib/supabase/server'

export default async function CardInfo() {
    const supabase = await createClient()
    const { data: cardInfo } = await supabase.from("cardInfo").select()

    return (
        <div className="min-h-screen bg-background dark:bg-[#000000] p-6">
            <pre className="text-foreground">
            {JSON.stringify(cardInfo, null, 2)}
        </pre>
        </div>
    )
}