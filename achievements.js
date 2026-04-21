/**
 * 成就系统 - 紧凑版，显示下一个成就提示
 */
(function() {
    const ACHIEVEMENTS = [
        { id: "beginner", name: "初窥门径", desc: "3星", icon: "🌱", requiredStars: 3 },
        { id: "explorer", name: "角之探索者", desc: "6星", icon: "📐", requiredStars: 6 },
        { id: "hunter", name: "定理猎手", desc: "9星", icon: "🔍", requiredStars: 9 },
        { id: "master", name: "几何大师", desc: "12星", icon: "🏅", requiredStars: 12 },
        { id: "sage", name: "圆之贤者", desc: "15星", icon: "🔮", requiredStars: 15 }
    ];

    function getTotalStars() {
        try {
            const saved = localStorage.getItem('circleGameData');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.levels && Array.isArray(data.levels)) {
                    return data.levels.reduce((sum, l) => sum + (l.stars || 0), 0);
                }
            }
        } catch(e) {}
        return 0;
    }

    function renderAchievements() {
        const container = document.getElementById('achievementsList');
        if (!container) return;
        const totalStars = getTotalStars();
        const starsDisplay = document.getElementById('starsTotalDisplay');
        if (starsDisplay) starsDisplay.innerHTML = `⭐ ${totalStars}/15`;

        container.innerHTML = ACHIEVEMENTS.map(ach => {
            const isUnlocked = totalStars >= ach.requiredStars;
            const statusClass = isUnlocked ? 'unlocked' : 'locked';
            return `
                <div class="achievement-card ${statusClass}">
                    <div class="achievement-icon">${ach.icon}</div>
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                    <div class="achievement-stars">⭐ ${ach.requiredStars}</div>
                </div>
            `;
        }).join('');

        let nextAchievement = null;
        for (let i = 0; i < ACHIEVEMENTS.length; i++) {
            if (totalStars < ACHIEVEMENTS[i].requiredStars) {
                nextAchievement = ACHIEVEMENTS[i];
                break;
            }
        }
        const hintEl = document.getElementById('nextAchievementHint');
        if (hintEl) {
            if (nextAchievement) {
                const starsNeeded = nextAchievement.requiredStars - totalStars;
                hintEl.innerHTML = `🎯 下一个: ${nextAchievement.name} · 还需 ${starsNeeded} 星`;
            } else {
                hintEl.innerHTML = `🏆 太棒了！你解锁了所有成就！ 🏆`;
            }
        }
    }

    let lastStars = -1;
    function pollStars() {
        const newStars = getTotalStars();
        if (newStars !== lastStars) {
            lastStars = newStars;
            renderAchievements();
        }
    }

    function init() {
        renderAchievements();
        lastStars = getTotalStars();
        setInterval(pollStars, 800);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) renderAchievements();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();