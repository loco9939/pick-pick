'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export default function RealTimeTicker() {
    const [activities, setActivities] = useState<string[]>([]);
    const t = useTranslations();

    useEffect(() => {
        const fetchActivities = async () => {
            const { data } = await supabase
                .from('worldcup_activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30);

            if (data && data.length > 0) {
                const formattedActivities = data.map(activity =>
                    t('활동 메시지', {
                        nickname: activity.nickname || t('익명의 사용자'),
                        worldcup: activity.worldcup_title,
                        candidate: activity.candidate_name
                    })
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
                    const message = t('활동 메시지', {
                        nickname: newActivity.nickname || t('익명의 사용자'),
                        worldcup: newActivity.worldcup_title,
                        candidate: newActivity.candidate_name
                    });
                    setActivities(prev => [message, ...prev].slice(0, 10));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [t]);

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
