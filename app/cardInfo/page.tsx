import { createClient } from '@/lib/supabase/server'

export default async function CardInfo() {
    const supabase = await createClient()
    const { data: cardInfo } = await supabase.from("cardInfo").select()

    return (
        <pre>
            {JSON.stringify(cardInfo, null, 2)}
        </pre>
    )
}