'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function RealTimeTicker() {
    const [activities, setActivities] = useState<string[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            const { data } = await supabase
                .from('worldcup_activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data && data.length > 0) {
                const formattedActivities = data.map(activity =>
                    `${activity.nickname || '익명의 사용자'}가 [${activity.worldcup_title}] 우승자로 '${activity.candidate_name}'을(를) 선택했습니다!`
                );
                setActivities(formattedActivities);
            }
        };

        fetchActivities();

        // Subscribe to new activities
        const channel = supabase
            .channel('real-time-ticker')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'worldcup_activities',
                },
                (payload) => {
                    const newActivity = payload.new as any;
                    const message = `${newActivity.nickname || '익명의 사용자'}가 [${newActivity.worldcup_title}] 우승자로 '${newActivity.candidate_name}'을(를) 선택했습니다!`;
                    setActivities(prev => [message, ...prev].slice(0, 10));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="w-full overflow-hidden bg-slate-900/80 border-y border-slate-800 py-2 backdrop-blur-sm">
            <div className="relative flex overflow-x-hidden">
                <div className="animate-marquee whitespace-nowrap py-1">
                    {activities.map((activity, index) => (
                        <span key={index} className="mx-4 text-sm text-slate-400">
                            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            {activity}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
