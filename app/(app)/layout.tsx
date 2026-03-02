import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileNav from '@/components/layout/MobileNav'
import QuickAddFAB from '@/components/shared/QuickAddFAB'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar profile={profile} />

                <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
                    {children}
                </main>
            </div>

            {/* Mobile: FAB central + Bottom nav */}
            <QuickAddFAB />
            <MobileNav />
        </div>
    )
}
