document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const levelSelect = document.getElementById('levelSelect');
    const gameScreen = document.getElementById('gameScreen');
    const levelGrid = document.getElementById('levelGrid');
    const resultModal = document.getElementById('resultModal');
    const ruleModal = document.getElementById('ruleModal');
    
    const gameTitle = document.getElementById('gameTitle');
    const totalScoreText = document.getElementById('totalScoreText');
    const starCountSpan = document.getElementById('starCount');
    const selectTitle = document.getElementById('selectTitle');
    const levelTitle = document.getElementById('levelTitle');
    const currentScore = document.getElementById('currentScore');
    const levelStar = document.getElementById('levelStar');
    const missionTitle = document.getElementById('missionTitle');
    const missionDesc = document.getElementById('missionDesc');
    const theoremDesc = document.getElementById('theoremDesc');
    const aiHintBox = document.getElementById('aiHintBox');
    const dataDisplay = document.getElementById('dataDisplay');
    const resultTitle = document.getElementById('resultTitle');
    const resultStar = document.getElementById('resultStar');
    const resultScore = document.getElementById('resultScore');
    const resultDesc = document.getElementById('resultDesc');
    const ruleTitle = document.getElementById('ruleTitle');
    const ruleContent = document.getElementById('ruleContent');
    const popFeedback = document.getElementById('popFeedback');

    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const aiHintBtn = document.getElementById('aiHintBtn');
    const contrastBtn = document.getElementById('contrastBtn');
    const langSelect = document.getElementById('langSelect');
    const backBtn = document.getElementById('backBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resetLevelBtn = document.getElementById('resetLevelBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const backToSelectBtn = document.getElementById('backToSelectBtn');
    const modalClose = document.querySelector('.close');

    let currentLang = 'zh';
    let currentLevel = 1;
    let levelScore = 0;
    let interactionCount = 0;
    let challengeProgress = { stage1: false, stage2: false, stage3: false, stage4: false };
    let gameData = {
        unlockedLevel: 1,
        totalScore: 0,
        levels: [
            { score: 0, stars: 0 },{ score: 0, stars: 0 },{ score: 0, stars: 0 },{ score: 0, stars: 0 },{ score: 0, stars: 0 }
        ]
    };
    let draggingPoint = null;
    let levelPoints = {};
    const circle = { x: 400, y: 300, radius: 200 };
    const canvasContainer = document.querySelector('.canvas-container');

const LEVEL_META = {
    1: {
        tag: { zh: '角度观察', en: 'Angle Discovery' },
        diff: { zh: '入门', en: 'Easy' },
        goal: {
            zh: '观察同弧对应的圆心角与圆周角关系',
            en: 'Observe the relationship between central and inscribed angles'
        },
        mastery: {
            zh: '你掌握了：同弧圆心角等于圆周角的两倍',
            en: 'You mastered: central angle = 2 × inscribed angle'
        }
    },
    2: {
        tag: { zh: '切线校准', en: 'Tangent Tuning' },
        diff: { zh: '进阶', en: 'Medium' },
        goal: {
            zh: '把切线调整到与半径形成直角',
            en: 'Calibrate the tangent to be perpendicular to the radius'
        },
        mastery: {
            zh: '你掌握了：切线与过切点半径垂直',
            en: 'You mastered: tangent is perpendicular to the radius'
        }
    },
    3: {
        tag: { zh: '同弦规律', en: 'Chord Pattern' },
        diff: { zh: '进阶', en: 'Medium' },
        goal: {
            zh: '观察同弦所对圆周角始终相等',
            en: 'Observe equal inscribed angles subtended by the same chord'
        },
        mastery: {
            zh: '你掌握了：同弦所对圆周角相等',
            en: 'You mastered: equal inscribed angles on the same chord'
        }
    },
    4: {
        tag: { zh: '四边形挑战', en: 'Quad Challenge' },
        diff: { zh: '进阶', en: 'Medium' },
        goal: {
            zh: '验证圆内接四边形对角和为 180°',
            en: 'Verify opposite angles sum to 180°'
        },
        mastery: {
            zh: '你掌握了：圆内接四边形对角互补',
            en: 'You mastered: opposite angles in a cyclic quadrilateral are supplementary'
        }
    },
    5: {
        tag: { zh: '综合冒险', en: 'Final Quest' },
        diff: { zh: '挑战', en: 'Hard' },
        goal: {
            zh: '连续完成 4 个几何规律验证阶段',
            en: 'Complete 4 geometry-discovery stages in one level'
        },
        mastery: {
            zh: '你掌握了：多个圆定理的综合运用',
            en: 'You mastered: combined application of circle theorems'
        }
    }
};

let feedbackState = 'idle';
let hintTier = 0;
let failCount = 0;
let microMilestones = {};
let lastEncourageKey = '';

function resetInteractionEnhancers() {
    feedbackState = 'idle';
    hintTier = 0;
    failCount = 0;
    microMilestones = {};
    lastEncourageKey = '';
    canvasContainer.classList.remove('on-track', 'near-target', 'milestone');
    aiHintBox.classList.remove('hint-normal', 'hint-encourage', 'hint-deep', 'show-bump');
}

function setCanvasMood(state) {
    canvasContainer.classList.remove('on-track', 'near-target');
    if (state === 'on-track') canvasContainer.classList.add('on-track');
    if (state === 'near-target') canvasContainer.classList.add('near-target');
}

function pulseMilestone() {
    canvasContainer.classList.remove('milestone');
    void canvasContainer.offsetWidth;
    canvasContainer.classList.add('milestone');
}

function showHintMessage(text, type = 'normal', duration = 2200) {
    aiHintBox.textContent = text;
    aiHintBox.classList.remove('hidden', 'hint-normal', 'hint-encourage', 'hint-deep', 'show-bump');
    aiHintBox.classList.add(`hint-${type}`, 'show-bump');
    clearTimeout(showHintMessage._timer);
    showHintMessage._timer = setTimeout(() => {
        aiHintBox.classList.add('hidden');
        aiHintBox.classList.remove('show-bump');
    }, duration);
}

function addRichScore(points, text = '+10', kind = 'explore') {
    levelScore += points;
    currentScore.textContent = `🎯 得分：${levelScore}`;
    popFeedback.textContent = text;
    popFeedback.classList.remove('hidden', 'feedback-explore', 'feedback-milestone', 'feedback-perfect');
    popFeedback.classList.add(`feedback-${kind}`);
    playBeep(kind === 'perfect' ? 1300 : 1000, 160);
    setTimeout(() => popFeedback.classList.add('hidden'), 850);
}

function getNearTargetInfo() {
    if (currentLevel === 1) {
        const diff = Math.abs(calcCentralAngle() - 2 * calcInscribedAngleAtC());
        return { value: diff, near: diff < 8, onTrack: diff < 15 };
    }
    if (currentLevel === 2) {
        const diff = Math.abs(calcTangentAngle() - 90);
        return { value: diff, near: diff < 3, onTrack: diff < 8 };
    }
    if (currentLevel === 3) {
        const diff = Math.abs(calcInscribedAngleAtC() - calcInscribedAngleAtD());
        return { value: diff, near: diff < 2.5, onTrack: diff < 6 };
    }
    if (currentLevel === 4) {
        const diff = Math.abs(calcQuadSum() - 180);
        return { value: diff, near: diff < 4, onTrack: diff < 10 };
    }
    if (currentLevel === 5) {
        const s1 = Math.abs(calcSemicircleAngle() - 90);
        const [t1, t2] = calcTangentLengths();
        const s2 = Math.abs(t1 - t2);
        const s3 = Math.abs(calcInscribedAngleAtC() + calcInscribedAngleAtD() - 180);
        const s4 = Math.abs(calcFinalQuadSum() - 180);
        const best = Math.min(s1, s2, s3, s4);
        return { value: best, near: best < 3, onTrack: best < 8 };
    }
    return { value: 999, near: false, onTrack: false };
}

function maybeEncouragePlayer() {
    const info = getNearTargetInfo();
    if (info.near && lastEncourageKey !== 'near') {
        lastEncourageKey = 'near';
        setCanvasMood('near-target');
        showHintMessage(
            currentLang === 'zh' ? '很接近了，再微调一下位置！' : 'You are very close — try a tiny adjustment!',
            'encourage',
            1800
        );
    } else if (info.onTrack && !info.near && lastEncourageKey !== 'track') {
        lastEncourageKey = 'track';
        setCanvasMood('on-track');
        showHintMessage(
            currentLang === 'zh' ? '方向对了，继续观察图形变化。' : 'Good direction — keep observing the shape.',
            'normal',
            1500
        );
    } else if (!info.onTrack) {
        lastEncourageKey = '';
        setCanvasMood('idle');
    }
}

function checkMicroMilestones() {
    if (currentLevel === 1) {
        const diff = Math.abs(calcCentralAngle() - 2 * calcInscribedAngleAtC());
        if (!microMilestones.l1a && diff < 12) {
            microMilestones.l1a = true;
            addRichScore(2, currentLang === 'zh' ? '发现规律 +2' : 'Pattern found +2', 'explore');
            showHintMessage(currentLang === 'zh' ? '你已经观察到角度比例的稳定性。' : 'You are noticing a stable angle ratio.', 'normal');
        }
    }
    if (currentLevel === 2) {
        const diff = Math.abs(calcTangentAngle() - 90);
        if (!microMilestones.l2a && diff < 6) {
            microMilestones.l2a = true;
            addRichScore(3, currentLang === 'zh' ? '校准接近 +3' : 'Almost calibrated +3', 'explore');
            showHintMessage(currentLang === 'zh' ? '切线快和半径形成直角了。' : 'The tangent is almost perpendicular to the radius.', 'encourage');
        }
    }
    if (currentLevel === 3) {
        const diff = Math.abs(calcInscribedAngleAtC() - calcInscribedAngleAtD());
        if (!microMilestones.l3a && diff < 4) {
            microMilestones.l3a = true;
            addRichScore(2, currentLang === 'zh' ? '同弦发现 +2' : 'Same chord found +2', 'explore');
        }
    }
    if (currentLevel === 4) {
        const diff = Math.abs(calcQuadSum() - 180);
        if (!microMilestones.l4a && diff < 8) {
            microMilestones.l4a = true;
            addRichScore(3, currentLang === 'zh' ? '对角接近 +3' : 'Opposite angles close +3', 'explore');
        }
    }
}

    // ========== 数学函数 ==========
    function getDistance(p1,p2){ return Math.hypot(p2.x-p1.x, p2.y-p1.y); }
    function calcAngleFromThree(p1, center, p2){
        const v1x = p1.x - center.x, v1y = p1.y - center.y;
        const v2x = p2.x - center.x, v2y = p2.y - center.y;
        const dot = v1x*v2x + v1y*v2y;
        const mag1 = Math.hypot(v1x, v1y), mag2 = Math.hypot(v2x, v2y);
        const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
        return Math.acos(cos) * (180 / Math.PI);
    }
    function calcSemicircleAngle(){ return calcAngleFromThree(levelPoints.A, levelPoints.C, levelPoints.B); }
    function calcTangentLengths(){ return [getDistance(levelPoints.P, levelPoints.T1), getDistance(levelPoints.P, levelPoints.T2)]; }
    function calcInscribedAngleAtC(){ return calcAngleFromThree(levelPoints.A, levelPoints.C, levelPoints.B); }
    function calcInscribedAngleAtD(){ return calcAngleFromThree(levelPoints.A, levelPoints.D, levelPoints.B); }
    function calcFinalQuadSum(){ return calcAngleFromThree(levelPoints.C, levelPoints.A, levelPoints.E) + calcAngleFromThree(levelPoints.B, levelPoints.C, levelPoints.E); }
    function calcCentralAngle(){
        const A=levelPoints.A, B=levelPoints.B, O=circle;
        let oaX=A.x-O.x, oaY=A.y-O.y, obX=B.x-O.x, obY=B.y-O.y;
        let dot=oaX*obX+oaY*obY, magOA=Math.hypot(oaX,oaY), magOB=Math.hypot(obX,obY);
        let cos=Math.max(-1,Math.min(1,dot/(magOA*magOB)));
        return Math.acos(cos)*180/Math.PI;
    }
    function calcTangentAngle(){
        const T=levelPoints.T, P=levelPoints.P, O=circle;
        let otX=T.x-O.x, otY=T.y-O.y, tpX=P.x-T.x, tpY=P.y-T.y;
        let dot=otX*tpX+otY*tpY, magOT=Math.hypot(otX,otY), magTP=Math.hypot(tpX,tpY);
        return Math.acos(Math.max(-1,Math.min(1,dot/(magOT*magTP))))*180/Math.PI;
    }
    function calcAngleA(){ return calcAngleFromThree(levelPoints.B, levelPoints.A, levelPoints.D); }
    function calcAngleC(){ return calcAngleFromThree(levelPoints.B, levelPoints.C, levelPoints.D); }
    function calcQuadSum(){ return calcAngleA()+calcAngleC(); }

    // ========== 关卡配置（优化满分条件） ==========
    const levelConfig = [
        {id:1,name:{en:"Central & Inscribed Angle",zh:"圆心角与圆周角"},theorem:{en:"Theorem: Central Angle = 2 × Inscribed Angle",zh:"定理：圆心角 = 2 × 圆周角"},mission:{title:{en:"Mission",zh:"任务"},desc:{en:"Drag points A/B/C to verify: the inscribed angle is always half the central angle for the same arc",zh:"拖动点A/B/C验证：同一段弧对应的圆周角永远是圆心角的一半"}},hint:{en:"Try dragging point C around the circle! Watch how the angles change, you'll find the central angle is always twice the inscribed angle.",zh:"试着拖动点C绕圆移动！观察角度变化，你会发现圆心角始终是圆周角的两倍。"},
        initPoints:()=>({A:{x:226.8,y:200,name:'A'},B:{x:573.2,y:200,name:'B'},C:{x:400,y:100,name:'C'}}),
        dataLabels:[{key:'central',label:{en:"Central Angle",zh:"圆心角"}},{key:'inscribed',label:{en:"Inscribed Angle",zh:"圆周角"}}],
        checkComplete:()=>Math.abs(calcCentralAngle()-2*calcInscribedAngleAtC())<3,
        checkPrecision:()=>{ let ca=calcCentralAngle(); return Math.abs(ca-120)<8 && Math.abs(ca-2*calcInscribedAngleAtC())<2; } },
        {id:2,name:{en:"Tangent & Radius",zh:"切线与半径"},theorem:{en:"Theorem: A tangent to a circle is perpendicular to the radius at the point of contact",zh:"定理：圆的切线，垂直于过切点的半径"},mission:{title:{en:"Mission",zh:"任务"},desc:{en:"Drag T to move the tangent point, then drag P to adjust the line. Calibrate it to be a perfect tangent (perpendicular to radius OT)",zh:"拖动T移动切点，再拖动P调整直线，把它校准为完美的切线（与半径OT垂直）"}},hint:{en:"A tangent only touches the circle at one point! The line is a tangent only when it forms a perfect 90° right angle with the radius OT.",zh:"切线只会和圆有一个交点！只有当直线和半径OT形成完美的90°直角时，它才是切线。"},
        initPoints:()=>({T:{x:600,y:300,name:'T'},P:{x:600,y:100,name:'P'}}),dataLabels:[{key:'tangentAngle',label:{en:"Tangent-Radius Angle",zh:"切线-半径夹角"}},{key:'error',label:{en:"Calibration Error",zh:"校准误差"}}],
        checkComplete:()=>Math.abs(calcTangentAngle()-90)<3,
        checkPrecision:()=>Math.abs(calcTangentAngle()-90)<2 },
        {id:3,name:{en:"Same Chord Angles",zh:"同弦圆周角"},theorem:{en:"Theorem: Inscribed angles subtended by the same chord are equal",zh:"定理：同一条弦所对的圆周角相等"},mission:{title:{en:"Mission",zh:"任务"},desc:{en:"Drag points C and D around the circle. Observe that angles ∠ACB and ∠ADB are always equal.",zh:"拖动点C和D在圆上移动，观察∠ACB和∠ADB始终相等。"}},hint:{en:"Chord AB is fixed! No matter where you drag C and D, the inscribed angles ∠ACB and ∠ADB will always be exactly the same.",zh:"弦AB是固定的！无论你把C和D拖到哪里，圆周角∠ACB和∠ADB永远完全相等。"},
        initPoints:()=>({A:{x:250,y:180,name:'A',fixed:true},B:{x:550,y:180,name:'B',fixed:true},C:{x:400,y:100,name:'C'},D:{x:300,y:80,name:'D'}}),
        dataLabels:[{key:'angleC',label:{en:"Angle ∠ACB",zh:"∠ACB 角度"}},{key:'angleD',label:{en:"Angle ∠ADB",zh:"∠ADB 角度"}},{key:'diff',label:{en:"Angle Difference",zh:"角度差"}}],
        checkComplete:()=>Math.abs(calcInscribedAngleAtC()-calcInscribedAngleAtD())<2,
        checkPrecision:()=>{ let c=calcInscribedAngleAtC(), d=calcInscribedAngleAtD(); return Math.abs(c-d)<0.5 && c>42 && c<55; } },
        {id:4,name:{en:"Cyclic Quadrilateral",zh:"圆内接四边形"},theorem:{en:"Theorem: Opposite angles in a cyclic quadrilateral sum to 180°",zh:"定理：圆内接四边形的对角和为180°"},mission:{title:{en:"Mission",zh:"任务"},desc:{en:"Drag points A/B/C/D to verify: opposite angles add up to 180°",zh:"拖动点A/B/C/D验证：四边形的对角相加永远等于180°"}},hint:{en:"Drag any vertex of the quadrilateral! The sum of each pair of opposite angles will always be 180 degrees.",zh:"拖动四边形的任意顶点！每一组对角的和永远是180度。"},
        initPoints:()=>({A:{x:400,y:100,name:'A'},B:{x:600,y:300,name:'B'},C:{x:400,y:500,name:'C'},D:{x:200,y:300,name:'D'}}),
        dataLabels:[{key:'angleA',label:{en:"Angle A",zh:"角A"}},{key:'angleC',label:{en:"Angle C",zh:"角C"}},{key:'sumAC',label:{en:"A + C Sum",zh:"A+C 总和"}}],
        checkComplete:()=>Math.abs(calcQuadSum()-180)<3,
        checkPrecision:()=>{ let a=calcAngleA(), c=calcAngleC(); return Math.abs(a-90)<8 && Math.abs(c-90)<8 && Math.abs(a+c-180)<2; } },
        {id:5,name:{en:"Final Comprehensive Challenge",zh:"最终综合挑战"},theorem:{en:"Final Challenge: Master all advanced circle theorems",zh:"最终挑战：掌握所有进阶圆定理"},mission:{title:{en:"Mission",zh:"任务"},desc:{en:"Complete 4 stages to verify advanced circle theorems: 1. Right angle in a semicircle; 2. Tangent length theorem; 3. Opposite angles in same chord; 4. Cyclic quadrilateral opposite angles sum to 180°",zh:"完成4个阶段验证进阶圆定理：1. 半圆所对圆周角为直角；2. 切线长定理；3. 同弦所对圆周角互补；4. 圆内接四边形对角和为180°"}},hint:{en:{stage1:"Stage 1: Drag point C around the circle! The angle ∠ACB is always 90°, because an angle inscribed in a semicircle is a right angle.",stage2:"Stage 2: Drag point P! Two tangents drawn from the same external point to a circle are always equal in length.",stage3:"Stage 3: Drag points C and D! Angles subtended by the same chord on opposite arcs always add up to 180°.",stage4:"Stage 4: Drag point E! Opposite angles in a cyclic quadrilateral always sum to 180°."},zh:{stage1:"阶段1：拖动点C绕圆移动！∠ACB永远是90°，因为半圆所对的圆周角是直角。",stage2:"阶段2：拖动点P！从圆外同一点引圆的两条切线，长度永远相等。",stage3:"阶段3：拖动点C和D！同一条弦在优弧和劣弧上所对的圆周角永远相加为180°。",stage4:"阶段4：拖动点E！圆内接四边形的对角永远相加为180°。"}},
        initPoints:()=>({A:{x:200,y:300,name:'A',fixed:true},B:{x:600,y:300,name:'B',fixed:true},C:{x:400,y:100,name:'C'},T1:{x:400,y:100,name:'T1'},T2:{x:400,y:500,name:'T2'},P:{x:700,y:300,name:'P'},D:{x:400,y:500,name:'D'},E:{x:250,y:450,name:'E'}}),
        dataLabels:[{key:'angleC',label:{en:"∠ACB (Semicircle)",zh:"∠ACB (半圆)"}},{key:'tangent1',label:{en:"Tangent PT1",zh:"切线PT1长度"}},{key:'tangent2',label:{en:"Tangent PT2",zh:"切线PT2长度"}},{key:'angleD',label:{en:"∠ADB",zh:"∠ADB"}},{key:'quadSum',label:{en:"Quad Opposite Sum",zh:"四边形对角和"}},{key:'progress',label:{en:"Challenge Progress",zh:"挑战进度"}}],
        checkStage1:()=>Math.abs(calcSemicircleAngle()-90)<3,
        checkStage2:()=>{let [a,b]=calcTangentLengths();return Math.abs(a-b)<1;},
        checkStage3:()=>Math.abs(calcInscribedAngleAtC()+calcInscribedAngleAtD()-180)<3,
        checkStage4:()=>Math.abs(calcFinalQuadSum()-180)<3,
        checkComplete:()=>challengeProgress.stage1&&challengeProgress.stage2&&challengeProgress.stage3&&challengeProgress.stage4,
        checkPrecision:()=>Math.abs(calcSemicircleAngle()-90)<2&&Math.abs(calcTangentLengths()[0]-calcTangentLengths()[1])<0.5&&Math.abs(calcInscribedAngleAtC()+calcInscribedAngleAtD()-180)<2&&Math.abs(calcFinalQuadSum()-180)<2}
    ];

    // 多语言包（精简，保留主要文本）
    const langPack = {
        en: {
            gameTitle: "Circle Geometry Adventure",
            selectTitle: "Select Level",
            totalScore: "Total Score: ",
            starCount: "⭐ ",
            ruleTitle: "How to Play",
            missionTitle: "Mission",
            nextLevel: "Next Level",
            backToLevels: "Back to Levels",
            locked: "Locked",
            completed: "Completed",
            greatJob: "Great job! You've mastered the theorem!",
            tryAgain: "Not yet completed. Keep trying!",
            buttons: {
                howToPlay: "📖 How to Play",
                aiHint: "✨ AI Hint",
                contrast: "🎨 High Contrast",
                submit: "✅ Submit Challenge",
                reset: "🔄 Reset Level"
            },
            rules: {
                gameRules: "🎯 Game Rules",
                rule1: "1. Complete each level's challenge to unlock the next level",
                rule2: "2. Each level has a maximum score of 100 points, up to 3 stars",
                rule3: "3. Drag points on the circle to verify the circle theorem",
                rule4: "4. Submit the challenge when you meet the mission requirements",
                scoringRules: "📊 Scoring Rules",
                score1: "• Basic Completion: 60 points",
                score2: "• Exploration Interaction (≥20 drags): 20 points",
                score3: "• Precision Challenge (perfect theorem): 20 points"
            },
            footer: {
                achievementsTitle: "🏆 Achievements",
                funFactsHeader: "📐 Geometry Fun Facts",
                scoringHeader: "🎯 Scoring Rules",
                scoringItems: [
                    "✅ Basic Completion: <strong>60 pts</strong>",
                    "🔍 Exploration Interaction (≥20 drags): <strong>20 pts</strong>",
                    "🎯 Precision Challenge (perfect theorem): <strong>20 pts</strong>",
                    "⭐ Max per level: <strong>100 pts → 3 stars</strong>"
                ],
                facts: [
                    "Did you know? Thales' theorem: An angle inscribed in a semicircle is always 90°.",
                    "A tangent to a circle is perpendicular to the radius at the point of contact.",
                    "In a cyclic quadrilateral, opposite angles sum to 180°.",
                    "From an external point, two tangent segments to a circle have equal lengths.",
                    "Angles in the same segment of a circle are equal.",
                    "The central angle is always twice any inscribed angle subtending the same arc."
                ]
            },
            achievements: {
                list: [
                    { name: "Curious Beginner", desc: "3 stars", icon: "🌱", requiredStars: 3 },
                    { name: "Angle Explorer", desc: "6 stars", icon: "📐", requiredStars: 6 },
                    { name: "Theorem Hunter", desc: "9 stars", icon: "🔍", requiredStars: 9 },
                    { name: "Geometry Master", desc: "12 stars", icon: "🏅", requiredStars: 12 },
                    { name: "Circle Sage", desc: "15 stars", icon: "🔮", requiredStars: 15 }
                ],
                nextHint: (needed) => `🎯 Next: Need ${needed} more star${needed !== 1 ? 's' : ''}`,
                allUnlocked: "🏆 Amazing! You've unlocked all achievements! 🏆"
            }
        },
        zh: {
            gameTitle: "圆几何探险",
            selectTitle: "选择关卡",
            totalScore: "总得分：",
            starCount: "⭐ ",
            ruleTitle: "玩法说明",
            missionTitle: "任务",
            nextLevel: "下一关",
            backToLevels: "返回关卡选择",
            locked: "已锁定",
            completed: "已完成",
            greatJob: "太棒了！你已经完全掌握了这个定理！",
            tryAgain: "尚未完成，继续加油！",
            buttons: {
                howToPlay: "📖 玩法说明",
                aiHint: "✨ AI提示",
                contrast: "🎨 高对比度",
                submit: "✅ 提交挑战",
                reset: "🔄 重置关卡"
            },
            rules: {
                gameRules: "🎯 游戏规则",
                rule1: "1. 完成每一关的挑战以解锁下一关",
                rule2: "2. 每关满分100分，最多3颗星",
                rule3: "3. 拖动圆上的点来验证圆定理",
                rule4: "4. 满足任务要求后提交挑战",
                scoringRules: "📊 得分规则",
                score1: "• 基础完成：60分",
                score2: "• 探索互动（≥20次拖动）：20分",
                score3: "• 精准挑战（完美定理）：20分"
            },
            footer: {
                achievementsTitle: "🏆 成就系统",
                funFactsHeader: "📐 几何趣味知识",
                scoringHeader: "🎯 得分规则",
                scoringItems: [
                    "✅ 基础完成: <strong>60分</strong>",
                    "🔍 探索互动 (≥20次拖动): <strong>20分</strong>",
                    "🎯 精准挑战 (完美定理): <strong>20分</strong>",
                    "⭐ 每关满分: <strong>100分 → 3星</strong>"
                ],
                facts: [
                    "你知道吗？泰勒斯定理：半圆所对的圆周角永远是90°。",
                    "圆的切线垂直于过切点的半径。",
                    "圆内接四边形的对角和为180°。",
                    "从圆外一点引圆的两条切线，长度相等。",
                    "同弧所对的圆周角相等。",
                    "圆心角是圆周角的两倍（同弧）。"
                ]
            },
            achievements: {
                list: [
                    { name: "初窥门径", desc: "3星", icon: "🌱", requiredStars: 3 },
                    { name: "角之探索者", desc: "6星", icon: "📐", requiredStars: 6 },
                    { name: "定理猎手", desc: "9星", icon: "🔍", requiredStars: 9 },
                    { name: "几何大师", desc: "12星", icon: "🏅", requiredStars: 12 },
                    { name: "圆之贤者", desc: "15星", icon: "🔮", requiredStars: 15 }
                ],
                nextHint: (needed) => `🎯 下一个成就: 还需 ${needed} 星`,
                allUnlocked: "🏆 太棒了！你解锁了所有成就！ 🏆"
            }
        }
    };

    let audioEnabled = false;
    function enableAudio(){ if(!audioEnabled) audioEnabled=true; }
    function playBeep(freq=800,duration=100){ if(!audioEnabled) return; try{ const audioCtx=new (window.AudioContext||window.webkitAudioContext)(); const oscillator=audioCtx.createOscillator(); const gainNode=audioCtx.createGain(); oscillator.connect(gainNode); gainNode.connect(audioCtx.destination); oscillator.frequency.value=freq; oscillator.type='sine'; gainNode.gain.setValueAtTime(0.3,audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+duration/1000); oscillator.start(audioCtx.currentTime); oscillator.stop(audioCtx.currentTime+duration/1000); }catch(e){} }
    function addScore(points,text="+10"){ levelScore+=points; currentScore.textContent=`🎯 得分：${levelScore}`; popFeedback.textContent=text; popFeedback.classList.remove('hidden'); playBeep(1000,150); setTimeout(()=>popFeedback.classList.add('hidden'),800); }

    function saveGameData(){ localStorage.setItem('circleGameData', JSON.stringify(gameData)); }
    function loadGameData(){ const saved=localStorage.getItem('circleGameData'); if(saved){ gameData=JSON.parse(saved); updateTotalScore(); } }
    function updateTotalScore(){ totalScoreText.textContent=langPack[currentLang].totalScore+gameData.totalScore; let totalStars=0; gameData.levels.forEach(l=>totalStars+=l.stars); starCountSpan.textContent=langPack[currentLang].starCount+totalStars+"/15"; }

   function renderLevelGrid() {
    levelGrid.innerHTML = '';
    levelConfig.forEach((level, idx) => {
        const levelData = gameData.levels[idx];
        const isUnlocked = level.id <= gameData.unlockedLevel;
        const meta = LEVEL_META[level.id];
        const card = document.createElement('div');
        card.className = `level-card ${isUnlocked ? '' : 'locked'}`;

        const diffClass =
            meta.diff[currentLang] === '入门' || meta.diff[currentLang] === 'Easy'
                ? 'diff-easy'
                : (meta.diff[currentLang] === '挑战' || meta.diff[currentLang] === 'Hard' ? 'diff-hard' : 'diff-mid');

        card.innerHTML = `
            <div class="level-number">${level.id}</div>
            <div class="level-name">${level.name[currentLang]}</div>
            <div class="level-meta">
                <span class="level-tag">${meta.tag[currentLang]}</span>
                <span class="level-diff ${diffClass}">${meta.diff[currentLang]}</span>
            </div>
            <div class="level-goal">${meta.goal[currentLang]}</div>
            <div class="level-stars">${'⭐'.repeat(levelData.stars)}${'☆'.repeat(3 - levelData.stars)}</div>
            ${!isUnlocked ? `<div class="lock-tip">${currentLang === 'zh' ? '继续收集星星来解锁' : 'Collect more stars to unlock'}</div>` : ''}
        `;

        if (isUnlocked) card.addEventListener('click', () => startLevel(level.id));
        levelGrid.appendChild(card);
    });
}

    function startLevel(levelId){
        applyLevelTheme(levelId);
        if (Number(levelId) === 3) {
    injectLevel3Mascots();
} else {
    removeLevel3Mascots();
}
        if (Number(levelId) === 1) {
            setTimeout(() => injectLevel1Mascots(), 100);
        } else {
            removeLevel1Mascots();
        }
        if (Number(levelId) === 2) {
            setTimeout(() => injectLevel2Mascots(), 100);
        } else {
            removeLevel2Mascots();
        }
        enableAudio();
        currentLevel=levelId;
        levelScore=0;
        interactionCount=0;
        challengeProgress={stage1:false,stage2:false,stage3:false,stage4:false};
        const level=levelConfig[levelId-1];
        levelPoints=level.initPoints();
        resetInteractionEnhancers();
        levelTitle.textContent=`关卡 ${levelId}: ${level.name[currentLang]}`;
        missionTitle.textContent=level.mission.title[currentLang];
        missionDesc.textContent=level.mission.desc[currentLang];
        theoremDesc.textContent=level.theorem[currentLang];
        currentScore.textContent=`🎯 得分：0`;
        levelStar.textContent='☆☆☆';
        renderDataDisplay();
        levelSelect.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        draw();
    }

    function renderDataDisplay(){
        const level=levelConfig[currentLevel-1];
        dataDisplay.innerHTML='';
        level.dataLabels.forEach(item=>{
            const div=document.createElement('div');
            div.className='data-item';
            div.innerHTML=`<div class="data-label">${item.label[currentLang]}</div><div class="data-value" id="data-${item.key}">0</div>`;
            dataDisplay.appendChild(div);
        });
    }

    // 绘图函数
    function drawAngleArc(vertex,p1,p2,color,radius=30){
        const angle1=Math.atan2(p1.y-vertex.y,p1.x-vertex.x);
        const angle2=Math.atan2(p2.y-vertex.y,p2.x-vertex.x);
        ctx.beginPath();
        ctx.arc(vertex.x,vertex.y,radius,angle1,angle2,angle1>angle2);
        ctx.strokeStyle=color;
        ctx.lineWidth=2;
        ctx.stroke();
    }
    function drawRightAngleMark(vertex,size=15){
        ctx.beginPath();
        ctx.rect(vertex.x-size,vertex.y-size,size,size);
        ctx.strokeStyle='#2ecc71';
        ctx.lineWidth=2;
        ctx.stroke();
    }
    function drawPoints() {
    Object.values(levelPoints).forEach(p => {
        const isDragging = p === draggingPoint;

        if (isDragging) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(244, 90, 166, 0.16)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(244, 90, 166, 0.22)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, isDragging ? 10 : 8, 0, Math.PI * 2);
        ctx.fillStyle = p.fixed ? '#666' : (isDragging ? '#f45aa6' : '#3a0ca3');
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, isDragging ? 10 : 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#1f2a44';
        ctx.font = 'bold 16px Quicksand, sans-serif';
        ctx.fillText(p.name, p.x + 12, p.y - 10);
    });
}

    function drawLevel1() {
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(levelPoints.A.x, levelPoints.A.y);
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(levelPoints.B.x, levelPoints.B.y);
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(levelPoints.C.x, levelPoints.C.y);
        ctx.lineTo(levelPoints.A.x, levelPoints.A.y);
        ctx.lineTo(levelPoints.B.x, levelPoints.B.y);
        ctx.closePath();
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawPoints();
    }
    function drawLevel2(){
        const angle = calcTangentAngle();
        const error = Math.abs(angle - 90);
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(levelPoints.T.x, levelPoints.T.y);
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 3;
        ctx.stroke();
        let tangentColor = '#e63946';
        if (error < 5) tangentColor = '#ffb703';
        if (error < 2) tangentColor = '#2ecc71';
        ctx.beginPath();
        const dx = levelPoints.P.x - levelPoints.T.x;
        const dy = levelPoints.P.y - levelPoints.T.y;
        const extend = 1000;
        ctx.moveTo(levelPoints.T.x - dx * extend, levelPoints.T.y - dy * extend);
        ctx.lineTo(levelPoints.T.x + dx * extend, levelPoints.T.y + dy * extend);
        ctx.strokeStyle = tangentColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        if (error < 2) drawRightAngleMark(levelPoints.T);
        drawPoints();
    }
    function drawLevel3(){
        const A = levelPoints.A;
        const B = levelPoints.B;
        const C = levelPoints.C;
        const D = levelPoints.D;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(B.x, B.y);
        ctx.closePath();
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(D.x, D.y);
        ctx.lineTo(B.x, B.y);
        ctx.closePath();
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawAngleArc(C, A, B, '#4cc9f0', 35);
        drawAngleArc(D, A, B, '#2ecc71', 35);
        drawPoints();
    }
    function drawLevel4(){
        ctx.beginPath();
        ctx.moveTo(levelPoints.A.x, levelPoints.A.y);
        ctx.lineTo(levelPoints.B.x, levelPoints.B.y);
        ctx.lineTo(levelPoints.C.x, levelPoints.C.y);
        ctx.lineTo(levelPoints.D.x, levelPoints.D.y);
        ctx.closePath();
        ctx.strokeStyle = '#4cc9f0';
        ctx.lineWidth = 2;
        ctx.stroke();
        drawPoints();
    }
    function drawLevel5(){
        const A = levelPoints.A, B = levelPoints.B, C = levelPoints.C;
        const T1 = levelPoints.T1, T2 = levelPoints.T2, P = levelPoints.P, D = levelPoints.D, E = levelPoints.E;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(B.x, B.y);
        ctx.closePath();
        ctx.strokeStyle = challengeProgress.stage1?'#2ecc71':'#4cc9f0';
        ctx.lineWidth = challengeProgress.stage1?3:2;
        ctx.stroke();
        drawAngleArc(C, A, B, '#4cc9f0', 35);
        if(Math.abs(calcSemicircleAngle()-90)<1) drawRightAngleMark(C,20);
        ctx.beginPath();
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(T1.x, T1.y);
        ctx.moveTo(circle.x, circle.y);
        ctx.lineTo(T2.x, T2.y);
        ctx.strokeStyle = '#f72585';
        ctx.lineWidth = 2;
        ctx.stroke();
        let [pt1,pt2]=calcTangentLengths();
        let tcolor = Math.abs(pt1-pt2)<0.5?'#2ecc71':'#ffb703';
        ctx.beginPath();
        ctx.moveTo(P.x, P.y);
        ctx.lineTo(T1.x, T1.y);
        ctx.moveTo(P.x, P.y);
        ctx.lineTo(T2.x, T2.y);
        ctx.strokeStyle = tcolor;
        ctx.lineWidth = challengeProgress.stage2?3:2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(D.x, D.y);
        ctx.lineTo(B.x, B.y);
        ctx.closePath();
        ctx.strokeStyle = challengeProgress.stage3?'#2ecc71':'#9b59b6';
        ctx.lineWidth = challengeProgress.stage3?3:2;
        ctx.stroke();
        drawAngleArc(D, A, B, '#9b59b6', 35);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(C.x, C.y);
        ctx.lineTo(B.x, B.y);
        ctx.lineTo(E.x, E.y);
        ctx.closePath();
        ctx.strokeStyle = challengeProgress.stage4?'#2ecc71':'#4cc9f0';
        ctx.lineWidth = challengeProgress.stage4?3:2;
        ctx.stroke();
        drawAngleArc(A, C, E, '#4cc9f0', 25);
        drawAngleArc(C, B, E, '#4cc9f0', 25);
        drawPoints();
    }

    function draw(){
        ctx.clearRect(0,0,800,600);
        ctx.beginPath();
        ctx.arc(circle.x,circle.y,circle.radius,0,Math.PI*2);
        ctx.strokeStyle='#4361ee';
        ctx.lineWidth=3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(circle.x,circle.y,6,0,Math.PI*2);
        ctx.fillStyle='#f72585';
        ctx.fill();
        ctx.fillStyle='#000';
        ctx.fillText('O',circle.x+10,circle.y-10);
        const lvl=currentLevel;
        if(lvl===1) drawLevel1();
        else if(lvl===2) drawLevel2();
        else if(lvl===3) drawLevel3();
        else if(lvl===4) drawLevel4();
        else if(lvl===5) drawLevel5();
        updateDataDisplay();
        if(currentLevel===5) updateChallengeProgress();
    }

    function updateChallengeProgress(){
        const level=levelConfig[4];
        if (!challengeProgress.stage1 && level.checkStage1()) {
    challengeProgress.stage1 = true;
    addRichScore(15, currentLang === 'zh' ? '直角发现！+15' : 'Right angle found! +15', 'milestone');
    pulseMilestone();
    showHintMessage(currentLang === 'zh' ? '第一阶段完成，继续挑战下一条规律。' : 'Stage 1 cleared — move on to the next theorem.', 'encourage', 2200);
}
if (!challengeProgress.stage2 && level.checkStage2()) {
    challengeProgress.stage2 = true;
    addRichScore(15, currentLang === 'zh' ? '切线定理！+15' : 'Tangent theorem! +15', 'milestone');
    pulseMilestone();
}
if (!challengeProgress.stage3 && level.checkStage3()) {
    challengeProgress.stage3 = true;
    addRichScore(15, currentLang === 'zh' ? '同弦规律！+15' : 'Chord pattern! +15', 'milestone');
    pulseMilestone();
}
if (!challengeProgress.stage4 && level.checkStage4()) {
    challengeProgress.stage4 = true;
    addRichScore(15, currentLang === 'zh' ? '终极验证！+15' : 'Final verification! +15', 'perfect');
    pulseMilestone();
}
        let completedCount=[challengeProgress.stage1,challengeProgress.stage2,challengeProgress.stage3,challengeProgress.stage4].filter(Boolean).length;
        const progEl=document.getElementById('data-progress');
        if(progEl) progEl.textContent=`${completedCount}/4 ${langPack[currentLang].completed}`;
    }

    function updateDataDisplay(){
        const lvl=currentLevel;
        if(lvl===1){ document.getElementById('data-central').textContent=calcCentralAngle().toFixed(1)+'°'; document.getElementById('data-inscribed').textContent=calcInscribedAngleAtC().toFixed(1)+'°'; }
        else if(lvl===2){ let a=calcTangentAngle(); document.getElementById('data-tangentAngle').textContent=a.toFixed(2)+'°'; document.getElementById('data-error').textContent=Math.abs(a-90).toFixed(2)+'°'; }
        else if(lvl===3){ let c=calcInscribedAngleAtC(),d=calcInscribedAngleAtD(); document.getElementById('data-angleC').textContent=c.toFixed(2)+'°'; document.getElementById('data-angleD').textContent=d.toFixed(2)+'°'; document.getElementById('data-diff').textContent=Math.abs(c-d).toFixed(2)+'°'; }
        else if(lvl===4){ let a=calcAngleA(),c=calcAngleC(); document.getElementById('data-angleA').textContent=a.toFixed(1)+'°'; document.getElementById('data-angleC').textContent=c.toFixed(1)+'°'; document.getElementById('data-sumAC').textContent=(a+c).toFixed(1)+'°'; }
        else if(lvl===5){ document.getElementById('data-angleC').textContent=calcSemicircleAngle().toFixed(2)+'°'; let [pt1,pt2]=calcTangentLengths(); document.getElementById('data-tangent1').textContent=pt1.toFixed(2); document.getElementById('data-tangent2').textContent=pt2.toFixed(2); document.getElementById('data-angleD').textContent=calcInscribedAngleAtD().toFixed(2)+'°'; document.getElementById('data-quadSum').textContent=calcFinalQuadSum().toFixed(2)+'°'; }
    }

    function getCanvasCoords(e){
        const rect=canvas.getBoundingClientRect();
        const scaleX=canvas.width/rect.width, scaleY=canvas.height/rect.height;
        const clientX=e.clientX??(e.touches?e.touches[0].clientX:0);
        const clientY=e.clientY??(e.touches?e.touches[0].clientY:0);
        return {x:(clientX-rect.left)*scaleX, y:(clientY-rect.top)*scaleY};
    }

    canvas.addEventListener('mousedown',(e)=>{ let m=getCanvasCoords(e); for(let p of Object.values(levelPoints)){ if(!p.fixed && getDistance(m,p)<15){ draggingPoint=p; break; } } });
    canvas.addEventListener('mousemove',(e)=>{ if(!draggingPoint) return; let m=getCanvasCoords(e); interactionCount++; if(currentLevel===5 && draggingPoint.name==='P'){ draggingPoint.x=m.x; draggingPoint.y=m.y; } else { let ang=Math.atan2(m.y-circle.y,m.x-circle.x); draggingPoint.x=circle.x+circle.radius*Math.cos(ang); draggingPoint.y=circle.y+circle.radius*Math.sin(ang); } if(interactionCount%10===0 && levelScore<80) addScore(1,"+1");maybeEncouragePlayer();
checkMicroMilestones(); draw(); });
    canvas.addEventListener('mouseup',()=>{ draggingPoint=null; });
    canvas.addEventListener('touchstart',(e)=>{ e.preventDefault(); let touch=e.touches[0]; let m=getCanvasCoords(touch); for(let p of Object.values(levelPoints)){ if(!p.fixed && getDistance(m,p)<20){ draggingPoint=p; break; } } },{passive:false});
    canvas.addEventListener('touchmove',(e)=>{ e.preventDefault(); if(!draggingPoint) return; let touch=e.touches[0]; let m=getCanvasCoords(touch); interactionCount++; if(currentLevel===5 && draggingPoint.name==='P'){ draggingPoint.x=m.x; draggingPoint.y=m.y; } else { let ang=Math.atan2(m.y-circle.y,m.x-circle.x); draggingPoint.x=circle.x+circle.radius*Math.cos(ang); draggingPoint.y=circle.y+circle.radius*Math.sin(ang); } if(interactionCount%10===0 && levelScore<80) addScore(1,"+1");canvas.addEventListener('mousemove', (e) => {
    if (!draggingPoint) return;
    let m = getCanvasCoords(e);
    interactionCount++;

    if (currentLevel === 5 && draggingPoint.name === 'P') {
        draggingPoint.x = m.x;
        draggingPoint.y = m.y;
    } else {
        let ang = Math.atan2(m.y - circle.y, m.x - circle.x);
        draggingPoint.x = circle.x + circle.radius * Math.cos(ang);
        draggingPoint.y = circle.y + circle.radius * Math.sin(ang);
    }

    if (interactionCount % 10 === 0 && levelScore < 80) addScore(1, "+1");

    maybeEncouragePlayer();
    checkMicroMilestones();
    draw();
}); draw(); },{passive:false});
    canvas.addEventListener('touchend',(e)=>{ e.preventDefault(); draggingPoint=null; });

    submitBtn.addEventListener('click', () => {
    const level = levelConfig[currentLevel - 1];
    const isComplete = level.checkComplete();
    const isPrecise = level.checkPrecision();

    // 防止 failCount 未定义时报错
    if (typeof window.failCount !== 'number') {
        window.failCount = 0;
    }

    // 失败反馈：从“静默失败”改成“轻提示 + 多次失败后更明确引导”
    if (!isComplete) {
        window.failCount++;

        const failText = window.failCount >= 3
            ? (currentLang === 'zh'
                ? '还差一点点，先观察右侧数据变化，再试一次。'
                : 'Very close — watch the data panel and try again.')
            : langPack[currentLang].tryAgain;

        // 如果你前面已经加了 showHintMessage，就优先用它
        if (typeof showHintMessage === 'function') {
            showHintMessage(
                failText,
                window.failCount >= 3 ? 'deep' : 'normal',
                2800
            );
        } else {
            aiHintBox.textContent = failText;
            aiHintBox.classList.remove('hidden');
            setTimeout(() => aiHintBox.classList.add('hidden'), 3000);
        }

        playBeep(400, 300);
        return;
    }

    // 成功后重置失败次数
    window.failCount = 0;

    // 基础评分逻辑保持不变
    let finalScore = 60;
    if (interactionCount >= 20) finalScore += 20;
    if (isPrecise) finalScore += 20;

    levelScore = finalScore;
    currentScore.textContent = `🎯 得分：${levelScore}`;

    // 星级判定保持不变
    let stars = 1;
    if (finalScore >= 80) stars = 2;
    if (finalScore >= 95) stars = 3;

    levelStar.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    // 存档逻辑保持不变
    const levelData = gameData.levels[currentLevel - 1];
    if (finalScore > levelData.score) {
        gameData.totalScore += (finalScore - levelData.score);
        levelData.score = finalScore;
        levelData.stars = stars;
    }

    if (currentLevel < levelConfig.length && currentLevel >= gameData.unlockedLevel) {
        gameData.unlockedLevel = currentLevel + 1;
    }

    saveGameData();
    updateTotalScore();

    // 完成反馈增强：优先使用 richer feedback
    if (typeof addRichScore === 'function') {
        addRichScore(
            0,
            stars === 3
                ? (currentLang === 'zh' ? '完美通关！' : 'Perfect Clear!')
                : (currentLang === 'zh' ? '挑战完成！' : 'Challenge Clear!'),
            stars === 3 ? 'perfect' : 'milestone'
        );
    }

    // 结果弹窗文案增强
    resultTitle.textContent = langPack[currentLang].levelComplete;
    resultStar.textContent = '⭐'.repeat(stars);
    resultScore.textContent =
        currentLang === 'zh'
            ? `最终得分：${finalScore} / 100`
            : `Final Score: ${finalScore} / 100`;

    // 如果你前面已经加了 LEVEL_META，就展示“你掌握了什么”
    if (typeof LEVEL_META !== 'undefined' && LEVEL_META[currentLevel] && LEVEL_META[currentLevel].mastery) {
        resultDesc.textContent = `${langPack[currentLang].greatJob}｜${LEVEL_META[currentLevel].mastery[currentLang]}`;
    } else {
        // 没有 LEVEL_META 时的兜底文案
        resultDesc.textContent = stars === 3
            ? (currentLang === 'zh'
                ? '太棒了！你不仅完成了挑战，还实现了精准验证！'
                : 'Excellent! You cleared the challenge with precision!')
            : (currentLang === 'zh'
                ? '恭喜完成挑战！你已经成功验证了本关的重要规律。'
                : 'Great job! You successfully verified the key pattern in this level.');
    }

    nextLevelBtn.style.display = currentLevel < levelConfig.length ? 'inline-block' : 'none';
    resultModal.classList.remove('hidden');

    playBeep(1200, 200);

    updateFooterLanguage();
    renderAchievements();
});

    resetLevelBtn.addEventListener('click',()=>{ startLevel(currentLevel); });
    backBtn.addEventListener('click',()=>{ removeLevel3Mascots();gameScreen.classList.add('hidden'); levelSelect.classList.remove('hidden'); renderLevelGrid(); });
    nextLevelBtn.addEventListener('click',()=>{ resultModal.classList.add('hidden'); if(currentLevel<levelConfig.length) startLevel(currentLevel+1); else { gameScreen.classList.add('hidden'); levelSelect.classList.remove('hidden'); renderLevelGrid(); } });
    backToSelectBtn.addEventListener('click',()=>{ removeLevel3Mascots();resultModal.classList.add('hidden'); gameScreen.classList.add('hidden'); levelSelect.classList.remove('hidden'); renderLevelGrid(); });
    aiHintBtn.addEventListener('click',()=>{
    const level=levelConfig[currentLevel-1];
    if(currentLevel===5){
        if(!challengeProgress.stage1) aiHintBox.textContent=level.hint[currentLang].stage1;
        else if(!challengeProgress.stage2) aiHintBox.textContent=level.hint[currentLang].stage2;
        else if(!challengeProgress.stage3) aiHintBox.textContent=level.hint[currentLang].stage3;
        else aiHintBox.textContent=level.hint[currentLang].stage4;
    }else{
        aiHintBox.textContent=level.hint[currentLang];
    }
    aiHintBox.classList.remove('hidden');
    setTimeout(()=>aiHintBox.classList.add('hidden'),5000);
});
    modalClose.addEventListener('click',()=>{ ruleModal.classList.add('hidden'); });
    window.addEventListener('click',(e)=>{ if(e.target===ruleModal) ruleModal.classList.add('hidden'); });
    contrastBtn.addEventListener('click',()=>{ document.body.classList.toggle('high-contrast'); });
    
    function updateRuleContent(){ const rules=langPack[currentLang].rules; ruleContent.innerHTML=`<h3>${rules.gameRules}</h3><p>${rules.rule1}</p><p>${rules.rule2}</p><p>${rules.rule3}</p><p>${rules.rule4}</p><h3>${rules.scoringRules}</h3><p>${rules.score1}</p><p>${rules.score2}</p><p>${rules.score3}</p>`; }

    function getTotalStars() {
        return gameData.levels.reduce((sum, l) => sum + (l.stars || 0), 0);
    }

    function renderAchievements() {
        const container = document.getElementById('achievementsList');
        if (!container) return;
        const totalStars = getTotalStars();
        const starsDisplay = document.getElementById('starsTotalDisplay');
        if (starsDisplay) starsDisplay.innerHTML = `⭐ ${totalStars}/15`;
        const achData = langPack[currentLang].achievements.list;
        container.innerHTML = achData.map(ach => {
            const isUnlocked = totalStars >= ach.requiredStars;
            const statusClass = isUnlocked ? 'unlocked' : 'locked';
            return `<div class="achievement-card ${statusClass}"><div class="achievement-icon">${ach.icon}</div><div class="achievement-name">${ach.name}</div><div class="achievement-desc">${ach.desc}</div><div class="achievement-stars">⭐ ${ach.requiredStars}</div></div>`;
        }).join('');
        let nextAchievement = null;
        for (let i = 0; i < achData.length; i++) {
            if (totalStars < achData[i].requiredStars) { nextAchievement = achData[i]; break; }
        }
        const hintEl = document.getElementById('nextAchievementHint');
        if (hintEl) {
            if (nextAchievement) {
                const starsNeeded = nextAchievement.requiredStars - totalStars;
                hintEl.innerHTML = langPack[currentLang].achievements.nextHint(starsNeeded);
            } else {
                hintEl.innerHTML = langPack[currentLang].achievements.allUnlocked;
            }
        }
    }

    function updateFooterLanguage() {
        document.getElementById('achievementsTitle').innerText = langPack[currentLang].footer.achievementsTitle;
        document.getElementById('funFactsHeader').innerText = langPack[currentLang].footer.funFactsHeader;
        document.getElementById('scoringHeader').innerText = langPack[currentLang].footer.scoringHeader;
        const scoringList = document.getElementById('scoringList');
        scoringList.innerHTML = langPack[currentLang].footer.scoringItems.map(item => `<li>${item}</li>`).join('');
        const factEl = document.getElementById('sideFact');
        if (factEl) {
            factEl.textContent = langPack[currentLang].footer.facts[0];
            if (window.factInterval) clearInterval(window.factInterval);
            let factIdx = 0;
            window.factInterval = setInterval(() => {
                factIdx = (factIdx + 1) % langPack[currentLang].footer.facts.length;
                factEl.style.opacity = '0';
                setTimeout(() => { factEl.textContent = langPack[currentLang].footer.facts[factIdx]; factEl.style.opacity = '1'; }, 300);
            }, 5500);
        }
    }

    function updateLang() {
        gameTitle.textContent = langPack[currentLang].gameTitle;
        selectTitle.textContent = langPack[currentLang].selectTitle;
        ruleTitle.textContent = langPack[currentLang].ruleTitle;
        const level = levelConfig[currentLevel-1];
        if (level && !levelSelect.classList.contains('hidden')) {
            missionTitle.textContent = level.mission.title[currentLang];
            missionDesc.textContent = level.mission.desc[currentLang];
            theoremDesc.textContent = level.theorem[currentLang];
        }
        nextLevelBtn.textContent = langPack[currentLang].nextLevel;
        backToSelectBtn.textContent = langPack[currentLang].backToLevels;
        howToPlayBtn.textContent = langPack[currentLang].buttons.howToPlay;
        aiHintBtn.textContent = langPack[currentLang].buttons.aiHint;
        contrastBtn.textContent = langPack[currentLang].buttons.contrast;
        submitBtn.textContent = langPack[currentLang].buttons.submit;
        resetLevelBtn.textContent = langPack[currentLang].buttons.reset;
        updateRuleContent();
        updateTotalScore();
        renderLevelGrid();
        renderDataDisplay();
        updateFooterLanguage();
        renderAchievements();
    }

    langSelect.addEventListener('change', () => {
        currentLang = langSelect.value;
        updateLang();
        if (!levelSelect.classList.contains('hidden')) draw();
    });

    loadGameData();
    langSelect.value = currentLang;
    updateLang();
    renderLevelGrid();
    updateFooterLanguage();
    let lastStars = -1;
    setInterval(() => {
        const newStars = getTotalStars();
        if (newStars !== lastStars) {
            lastStars = newStars;
            renderAchievements();
        }
    }, 800);
});
/* =========================================
   探索中心 / 游戏大厅增强
========================================= */

const HUB_FACTS = {
    zh: [
        '你知道吗？半圆所对的圆周角恒为 90°。',
        '现实中的车轮、钟表和轨道设计都离不开圆几何。',
        '同弦所对的圆周角相等，是很多证明题的核心入口。',
        '切线与过切点半径垂直，是圆几何里最经典的关系之一。',
        '圆内接四边形的对角和为 180°，常用于快速判断。'
    ],
    en: [
        'Did you know? An angle subtended by a diameter is always 90°.',
        'Circle geometry appears in wheels, clocks, and track design.',
        'Equal inscribed angles on the same chord are a key proof shortcut.',
        'A tangent is perpendicular to the radius at the point of tangency.',
        'Opposite angles in a cyclic quadrilateral always sum to 180°.'
    ]
};

const HUB_TODAY = {
    1: {
        zh: ['角度观察', '观察同弧对应的圆心角与圆周角关系'],
        en: ['Angle Discovery', 'Observe the relationship between central and inscribed angles']
    },
    2: {
        zh: ['切线的秘密', '让切线与半径形成完美直角'],
        en: ['Secret of Tangency', 'Make the tangent perfectly perpendicular to the radius']
    },
    3: {
        zh: ['同弦规律', '比较不同位置的圆周角是否保持一致'],
        en: ['Chord Pattern', 'Compare whether inscribed angles stay equal']
    },
    4: {
        zh: ['四边形挑战', '验证圆内接四边形对角和的秘密'],
        en: ['Quadrilateral Quest', 'Verify the opposite-angle rule']
    },
    5: {
        zh: ['终极探索', '连续完成四个几何规律的综合验证'],
        en: ['Final Quest', 'Complete a combined four-step verification']
    }
};

function getCompletedLevels() {
    if (!window.gameData || !Array.isArray(gameData.levels)) return 0;
    return gameData.levels.filter(level => (level.score || 0) > 0).length;
}

function getTotalStars() {
    if (!window.gameData || !Array.isArray(gameData.levels)) return 0;
    return gameData.levels.reduce((sum, level) => sum + (level.stars || 0), 0);
}

function getTodayLevelId() {
    if (!window.gameData || !gameData.unlockedLevel) return 1;
    return Math.min(gameData.unlockedLevel, 5);
}

function updateHubProgress() {
    const completed = getCompletedLevels();
    const totalLevels = window.levelConfig ? levelConfig.length : 5;
    const stars = getTotalStars();
    const maxStars = totalLevels * 3;
    const t = HUB_LANG[currentLang] || HUB_LANG.zh;

    const levelProgressText = document.getElementById('levelProgressText');
    const starProgressText = document.getElementById('starProgressText');
    const progressFill = document.getElementById('progressFill');
    const progressTip = document.getElementById('progressTip');

    if (levelProgressText) levelProgressText.textContent = `${completed} / ${totalLevels}`;
    if (starProgressText) starProgressText.textContent = `${stars} / ${maxStars}`;

    const progress = maxStars ? Math.round((stars / maxStars) * 100) : 0;
    if (progressFill) progressFill.style.width = `${progress}%`;

    if (progressTip) {
        progressTip.textContent = stars === maxStars
            ? t.progressAllDone
            : t.progressLeft(maxStars - stars);
    }
}

function updateTodayChallenge() {
    const levelId = getTodayLevelId();
    const todayTitle = document.getElementById('todayTitle');
    const todayDesc = document.getElementById('todayDesc');
    const todayBtn = document.getElementById('todayChallengeBtn');

    if (!todayTitle || !todayDesc || !todayBtn) return;

    const meta = HUB_TODAY[levelId] || HUB_TODAY[1];
    todayTitle.textContent = meta[currentLang][0];
    todayDesc.textContent = meta[currentLang][1];
    todayBtn.textContent = (HUB_LANG[currentLang] || HUB_LANG.zh).todayBtn;

    todayBtn.onclick = () => {
        if (typeof startLevel === 'function') {
            startLevel(levelId);
        }
    };
}

function rotateFunFacts() {
    const sideFact = document.getElementById('sideFact');
    if (!sideFact) return;

    const facts = HUB_FACTS[currentLang] || HUB_FACTS.zh;
    let currentIndex = Math.floor(Math.random() * facts.length);

    sideFact.textContent = facts[currentIndex];

    setInterval(() => {
        currentIndex = (currentIndex + 1) % facts.length;
        sideFact.classList.add('is-switching');
        setTimeout(() => {
            sideFact.textContent = facts[currentIndex];
            sideFact.classList.remove('is-switching');
        }, 220);
    }, 5000);
}

function updateAchievementSummary() {
    const box = document.querySelector('.achievements-compact');
    const completed = getCompletedLevels();
    const stars = getTotalStars();
    const t = HUB_LANG[currentLang] || HUB_LANG.zh;

    if (!box) return;

    let tip = '';
    if (completed === 0) {
        tip = t.achievementStart;
    } else if (completed < 3) {
        tip = t.achievementMid(completed);
    } else {
        tip = t.achievementHigh(stars);
    }

    box.setAttribute('data-achievement-tip', tip);
}

function highlightLevelPath() {
    const nodes = document.querySelectorAll('.level-path-strip .path-node');
    const unlocked = window.gameData?.unlockedLevel || 1;
    nodes.forEach((node, index) => {
        node.classList.toggle('active', index < unlocked);
    });
}

function addHubPointerEffect() {
    const hub = document.getElementById('exploreHub');
    if (!hub) return;

    hub.addEventListener('mousemove', (e) => {
        const panels = hub.querySelectorAll('.hero-panel');
        panels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
            panel.style.transform = `translateY(-2px) rotateX(${-y}deg) rotateY(${x}deg)`;
        });
    });

    hub.addEventListener('mouseleave', () => {
        hub.querySelectorAll('.hero-panel').forEach(panel => {
            panel.style.transform = '';
        });
    });
}

function initExploreHub() {
    try {
        updateExploreHubLanguage();
    } catch (e) { console.warn('updateExploreHubLanguage failed:', e); }

    try {
        updateHubProgress();
    } catch (e) { console.warn('updateHubProgress failed:', e); }

    try {
        updateTodayChallenge();
    } catch (e) { console.warn('updateTodayChallenge failed:', e); }

    try {
        updateAchievementSummary();
    } catch (e) { console.warn('updateAchievementSummary failed:', e); }

    try {
        highlightLevelPath();
    } catch (e) { console.warn('highlightLevelPath failed:', e); }

    try {
        addHubPointerEffect();
    } catch (e) { console.warn('addHubPointerEffect failed:', e); }

    try {
        rotateFunFacts();
    } catch (e) { console.warn('rotateFunFacts failed:', e); }
}

/* 初始执行 - 提前到DOMContentLoaded避免空白 */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initExploreHub(), 0);
});

/* 保留load事件作为备份 */
window.addEventListener('load', () => {
    initExploreHub();
});

/* 如果你已有这些更新函数，补一层联动刷新 */
const _originRenderAchievements = window.renderAchievements;
if (typeof _originRenderAchievements === 'function') {
    window.renderAchievements = function (...args) {
        const result = _originRenderAchievements.apply(this, args);
        updateHubProgress();
        updateAchievementSummary();
        highlightLevelPath();
        return result;
    };
}

const _originUpdateTotalScore = window.updateTotalScore;
if (typeof _originUpdateTotalScore === 'function') {
    window.updateTotalScore = function (...args) {
        const result = _originUpdateTotalScore.apply(this, args);
        updateHubProgress();
        return result;
    };
}
const HUB_LANG = {
    zh: {
        todayBadge: '🎯 今日挑战',
        progressBadge: '🌟 学习进度',
        guideBadge: '🧭 快速引导',
        todayBtn: '立即挑战',

        levelProgressLabel: '已完成关卡',
        starProgressLabel: '已收集星星',

        guide1: '拖动点，观察图形和角度变化',
        guide2: '查看右侧数据，寻找几何规律',
        guide3: '卡住时可以使用 AI 提示',

        path0: '起点',
        path1: '角度观察',
        path2: '切线校准',
        path3: '同弦规律',
        path4: '终极挑战',

        progressAllDone: '你已经点亮全部几何星图，太厉害了！',
        progressLeft: (n) => `继续探索，距离全满星还差 ${n} 颗`,

        achievementStart: '🏆 开始你的第一场几何探险，解锁首个成就吧！',
        achievementMid: (n) => `🏆 最新进展：你已完成 ${n} 关，继续冲击下一个成就！`,
        achievementHigh: (n) => `🏆 探索者状态良好：已收集 ${n} 颗星，距离满星更近一步。`
    },

    en: {
        todayBadge: '🎯 Today\'s Challenge',
        progressBadge: '🌟 Learning Progress',
        guideBadge: '🧭 Quick Guide',
        todayBtn: 'Start Now',

        levelProgressLabel: 'Completed Levels',
        starProgressLabel: 'Collected Stars',

        guide1: 'Drag points to observe changes in shapes and angles',
        guide2: 'Watch the data panel and look for geometry patterns',
        guide3: 'Use AI Hint when you get stuck',

        path0: 'Start',
        path1: 'Angle Discovery',
        path2: 'Tangent Tuning',
        path3: 'Chord Pattern',
        path4: 'Final Quest',

        progressAllDone: 'You have lit up every geometry star map!',
        progressLeft: (n) => `${n} stars left to complete the whole map`,

        achievementStart: '🏆 Start your first geometry quest to unlock your first achievement!',
        achievementMid: (n) => `🏆 Progress update: you have cleared ${n} levels. Keep going!`,
        achievementHigh: (n) => `🏆 Explorer status: ${n} stars collected, getting closer to full mastery.`
    }
};
function updateExploreHubLanguage() {
    const t = HUB_LANG[currentLang] || HUB_LANG.zh;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('todayBadge', t.todayBadge);
    setText('progressBadge', t.progressBadge);
    setText('guideBadge', t.guideBadge);
    setText('levelProgressLabel', t.levelProgressLabel);
    setText('starProgressLabel', t.starProgressLabel);

    setText('guideItem1', t.guide1);
    setText('guideItem2', t.guide2);
    setText('guideItem3', t.guide3);

    setText('pathNode0', t.path0);
    setText('pathNode1', t.path1);
    setText('pathNode2', t.path2);
    setText('pathNode3', t.path3);
    setText('pathNode4', t.path4);

    const todayBtn = document.getElementById('todayChallengeBtn');
    if (todayBtn) todayBtn.textContent = t.todayBtn;
}
langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;

    // 你原本已有的语言更新函数
    if (typeof updateFooterLanguage === 'function') updateFooterLanguage();
    if (typeof renderLevelGrid === 'function') renderLevelGrid();
    if (typeof renderAchievements === 'function') renderAchievements();

    // 新增模块同步切换
    updateExploreHubLanguage();
    updateHubProgress();
    updateTodayChallenge();
    updateAchievementSummary();
    highlightLevelPath();
});
/* =========================================
   按关卡切换底部主题
========================================= */

function applyLevelTheme(levelId = null) {
    const body = document.body;
    if (!body) return;

    const previousTheme = Array.from(body.classList).find(c => c.startsWith('level-theme-') || c === 'home-theme');

    body.classList.remove(
        'home-theme',
        'level-theme-1',
        'level-theme-2',
        'level-theme-3',
        'level-theme-4',
        'level-theme-5'
    );

    if (!levelId) {
        body.classList.add('home-theme');
        console.log(`[主题切换] ${previousTheme || '无'} → home-theme`);
        return;
    }

    const safeId = Math.max(1, Math.min(5, Number(levelId) || 1));
    const newTheme = `level-theme-${safeId}`;
    body.classList.add(newTheme);

    console.log(`[主题切换] ${previousTheme || '无'} → ${newTheme}`);

    requestAnimationFrame(() => {
        body.style.display = 'none';
        body.offsetHeight;
        body.style.display = '';
        console.log(`[主题应用] ${newTheme} 已强制重绘`);
    });
}
/* ===== Level 3 卡通角色函数 ===== */

function injectLevel3Mascots() {
    removeLevel3Mascots();

    const canvasContainer = document.querySelector('.canvas-container');
    const infoBox = document.querySelector('.info-box');

    if (!canvasContainer || !document.body.classList.contains('level-theme-3')) return;

    // 左侧吉祥物
    const leftMascot = document.createElement('div');
    leftMascot.className = 'level3-mascot mascot-left';
    leftMascot.innerHTML = `
        <div class="mascot-body"></div>
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="blush-left"></div>
        <div class="blush-right"></div>
    `;

    // 右侧吉祥物
    const rightMascot = document.createElement('div');
    rightMascot.className = 'level3-mascot mascot-right';
    rightMascot.innerHTML = `
        <div class="mascot-body"></div>
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="blush-left"></div>
        <div class="blush-right"></div>
    `;

    // 顶部吉祥物
    const topMascot = document.createElement('div');
    topMascot.className = 'level3-mascot mascot-top';
    topMascot.innerHTML = `
        <div class="mascot-body"></div>
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="blush-left"></div>
        <div class="blush-right"></div>
    `;

    // 底部吉祥物
    const bottomMascot = document.createElement('div');
    bottomMascot.className = 'level3-mascot mascot-bottom';
    bottomMascot.innerHTML = `
        <div class="mascot-body"></div>
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="blush-left"></div>
        <div class="blush-right"></div>
    `;

    // 左上角吉祥物
    const topLeftMascot = document.createElement('div');
    topLeftMascot.className = 'level3-mascot mascot-top-left';
    topLeftMascot.innerHTML = `
        <div class="mascot-body"></div>
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="blush-left"></div>
        <div class="blush-right"></div>
    `;

    // 右上角吉祥物
    const topRightMascot = document.createElement('div');
    topRightMascot.className = 'level3-mascot mascot-top-right';
    topRightMascot.innerHTML = `
        <div class="mascot-body"></div>
        <div class="eye-left"></div>
        <div class="eye-right"></div>
        <div class="blush-left"></div>
        <div class="blush-right"></div>
    `;

    // 添加所有吉祥物到容器
    canvasContainer.appendChild(leftMascot);
    canvasContainer.appendChild(rightMascot);
    canvasContainer.appendChild(topMascot);
    canvasContainer.appendChild(bottomMascot);
    canvasContainer.appendChild(topLeftMascot);
    canvasContainer.appendChild(topRightMascot);

    if (infoBox) {
        const helper = document.createElement('div');
        helper.className = 'level3-helper';
        helper.innerHTML = `
            <div class="helper-star"></div>
            <div class="eye-left"></div>
            <div class="eye-right"></div>
        `;
        infoBox.appendChild(helper);
    }
}

function removeLevel3Mascots() {
    document.querySelectorAll('.level3-mascot, .level3-helper').forEach(el => el.remove());
}

/* 页面初始加载：首页默认风格 */
window.addEventListener('load', () => {
    applyLevelTheme(null);
});

/* 进入关卡时切换主题 */
if (typeof startLevel === 'function') {
    const __originalStartLevel = startLevel;
    startLevel = function(levelId) {
        applyLevelTheme(levelId);
        return __originalStartLevel.call(this, levelId);
    };
}

/* 返回首页时切回首页风格 */
const backBtnEl = document.getElementById('backBtn');
if (backBtnEl) {
    backBtnEl.addEventListener('click', () => {
        setTimeout(() => applyLevelTheme(null), 50);
    });
}

const backToSelectBtnEl = document.getElementById('backToSelectBtn');
if (backToSelectBtnEl) {
    backToSelectBtnEl.addEventListener('click', () => {
        setTimeout(() => applyLevelTheme(null), 50);
    });
}
/* ===== Level 1 卡通形象函数 - 几何花园精灵系统 ===== */

function injectLevel1Mascots() {
    removeLevel1Mascots();

    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer || !document.body.classList.contains('level-theme-1')) return;

    /* 1. 小花精灵 × 4（四角分布） */
    const flowerPositions = ['pos-topleft', 'pos-topright', 'pos-midleft', 'pos-midright'];
    flowerPositions.forEach(pos => {
        const flower = document.createElement('div');
        flower.className = `level1-mascot mascot-flower ${pos}`;
        flower.innerHTML = `
            <div class="flower-head"></div>
            <div class="petal petal-1"></div>
            <div class="petal petal-2"></div>
            <div class="petal petal-3"></div>
            <div class="petal petal-4"></div>
            <div class="petal petal-5"></div>
            <div class="face">
                <div class="eye-left"><div class="eye-shine"></div></div>
                <div class="eye-right"><div class="eye-shine"></div></div>
                <div class="cheek-left"></div>
                <div class="cheek-right"></div>
                <div class="mouth"></div>
            </div>
            <div class="stem"></div>
        `;
        canvasContainer.appendChild(flower);
    });

    /* 2. 小蝴蝶 × 3（飞舞路径） */
    const butterflyPositions = ['pos-fly1', 'pos-fly2', 'pos-fly3'];
    butterflyPositions.forEach(pos => {
        const butterfly = document.createElement('div');
        butterfly.className = `level1-mascot mascot-butterfly ${pos}`;
        butterfly.innerHTML = `
            <div class="butterfly-body"></div>
            <div class="wing-left"></div>
            <div class="wing-right"></div>
            <div class="antenna-left"></div>
            <div class="antenna-right"></div>
        `;
        canvasContainer.appendChild(butterfly);
    });

    /* 3. 小蜜蜂 × 2（勤劳飞舞） */
    const beePositions = ['pos-bee1', 'pos-bee2'];
    beePositions.forEach(pos => {
        const bee = document.createElement('div');
        bee.className = `level1-mascot mascot-bee ${pos}`;
        bee.innerHTML = `
            <div class="bee-body"></div>
            <div class="bee-wing-l"></div>
            <div class="bee-wing-r"></div>
            <div class="bee-eye left"></div>
            <div class="bee-eye right"></div>
            <div class="bee-stinger"></div>
        `;
        canvasContainer.appendChild(bee);
    });

    /* 4. 小蘑菇 × 2（地面装饰） */
    const mushroomPositions = ['pos-ground1', 'pos-ground2'];
    mushroomPositions.forEach(pos => {
        const mushroom = document.createElement('div');
        mushroom.className = `level1-mascot mascot-mushroom ${pos}`;
        mushroom.innerHTML = `
            <div class="mushroom-cap">
                <div class="cap-spot spot-1"></div>
                <div class="cap-spot spot-2"></div>
                <div class="cap-spot spot-3"></div>
            </div>
            <div class="mushroom-stem">
                <div class="mushroom-face">
                    <div class="mushroom-eye left"></div>
                    <div class="mushroom-eye right"></div>
                    <div class="mushroom-blush left"></div>
                    <div class="mushroom-blush right"></div>
                    <div class="mushroom-mouth"></div>
                </div>
            </div>
        `;
        canvasContainer.appendChild(mushroom);
    });

    /* 5. 几何星星 × 3（闪光点缀） */
    const starPositions = ['pos-twinkle1', 'pos-twinkle2', 'pos-twinkle3'];
    starPositions.forEach(pos => {
        const star = document.createElement('div');
        star.className = `level1-mascot mascot-star ${pos}`;
        star.innerHTML = `
            <div class="star-body"></div>
            <div class="star-face">
                <div class="star-eye left"></div>
                <div class="star-eye right"></div>
                <div class="star-smile"></div>
            </div>
        `;
        canvasContainer.appendChild(star);
    });

    /* 6. 叶子小精灵 × 2（绿色伙伴） */
    const leafPositions = ['pos-leaf1', 'pos-leaf2'];
    leafPositions.forEach(pos => {
        const leaf = document.createElement('div');
        leaf.className = `level1-mascot mascot-leaf ${pos}`;
        leaf.innerHTML = `
            <div class="leaf-body">
                <div class="leaf-vein"></div>
            </div>
            <div class="leaf-face">
                <div class="leaf-eye left"></div>
                <div class="leaf-eye right"></div>
                <div class="leaf-cheek left"></div>
                <div class="leaf-cheek right"></div>
                <div class="leaf-mouth"></div>
            </div>
        `;
        canvasContainer.appendChild(leaf);
    });

    console.log('[第一关精灵] 已注入 14 个几何花园卡通形象 ✓');
}

function removeLevel1Mascots() {
    document.querySelectorAll('.level1-mascot').forEach(el => el.remove());
}

/* ===== Level 2 卡通形象函数 - 几何花园路径精灵系统 ===== */
function injectLevel2Mascots() {
    removeLevel2Mascots();

    const canvasContainer = document.querySelector('.canvas-container');
    if (!canvasContainer || !document.body.classList.contains('level-theme-2')) return;

    /* 1. 路径引导精灵 × 4（四角分布） */
    const guidePositions = ['pos-corner-tl', 'pos-corner-tr', 'pos-corner-bl', 'pos-corner-br'];
    guidePositions.forEach(pos => {
        const guide = document.createElement('div');
        guide.className = `level2-mascot mascot-path-guide ${pos}`;
        guide.innerHTML = `
            <div class="guide-body"></div>
            <div class="guide-face">
                <div class="eye-left"></div>
                <div class="eye-right"></div>
                <div class="cheek-left"></div>
                <div class="cheek-right"></div>
                <div class="mouth"></div>
            </div>
            <div class="guide-compass">
                <div class="compass-arrow"></div>
            </div>
        `;
        canvasContainer.appendChild(guide);
    });

    /* 2. 几何节点精灵 × 4（边缘中部） */
    const nodePositions = ['pos-edge-lt', 'pos-edge-rt', 'pos-edge-lb', 'pos-edge-rb'];
    nodePositions.forEach(pos => {
        const node = document.createElement('div');
        node.className = `level2-mascot mascot-node-sprite ${pos}`;
        node.innerHTML = `
            <div class="node-hexagon"></div>
            <div class="node-core"></div>
            <div class="node-face">
                <div class="node-eye left"></div>
                <div class="node-eye right"></div>
                <div class="node-smile"></div>
            </div>
        `;
        canvasContainer.appendChild(node);
    });

    /* 3. 连接线小助手 × 2（上下边缘） */
    const connectorPositions = ['pos-line-t', 'pos-line-b'];
    connectorPositions.forEach(pos => {
        const connector = document.createElement('div');
        connector.className = `level2-mascot mascot-connector ${pos}`;
        connector.innerHTML = `
            <div class="connector-body"></div>
            <div class="connector-dot-start"></div>
            <div class="connector-dot-end"></div>
            <div class="connector-eye left"></div>
            <div class="connector-eye right"></div>
        `;
        canvasContainer.appendChild(connector);
    });

    /* 4. 方向指示鸟 × 2（上方两侧） */
    const birdPositions = ['pos-fly-ul', 'pos-fly-ur'];
    birdPositions.forEach(pos => {
        const bird = document.createElement('div');
        bird.className = `level2-mascot mascot-direction-bird ${pos}`;
        bird.innerHTML = `
            <div class="bird-body"></div>
            <div class="bird-wing-left"></div>
            <div class="bird-wing-right"></div>
            <div class="bird-eye left"></div>
            <div class="bird-eye right"></div>
            <div class="bird-beak"></div>
            <div class="bird-arrow-tail"></div>
        `;
        canvasContainer.appendChild(bird);
    });

    /* 5. 几何花朵 × 2（底部两侧） */
    const flowerPositions = ['pos-garden-bl', 'pos-garden-br'];
    flowerPositions.forEach(pos => {
        const flower = document.createElement('div');
        flower.className = `level2-mascot mascot-geo-flower ${pos}`;
        flower.innerHTML = `
            <div class="flower-stem"></div>
            <div class="flower-center">
                <div class="petal petal-1"></div>
                <div class="petal petal-2"></div>
                <div class="petal petal-3"></div>
                <div class="petal petal-4"></div>
                <div class="petal petal-5"></div>
                <div class="petal petal-6"></div>
                <div class="flower-core"></div>
                <div class="flower-face">
                    <div class="flower-eye left"></div>
                    <div class="flower-eye right"></div>
                    <div class="flower-blush left"></div>
                    <div class="flower-blush right"></div>
                    <div class="flower-mouth"></div>
                </div>
            </div>
        `;
        canvasContainer.appendChild(flower);
    });

    console.log('[第二关精灵] 已注入 14 个几何花园路径卡通形象 ✓');
}

function removeLevel2Mascots() {
    document.querySelectorAll('.level2-mascot').forEach(el => el.remove());
}

/* =========================================================
   Level 3 背景增强增量代码
   粘贴到 v4script.js 最底部
========================================================= */

(function () {
    let geoParticlesCreated = false;
    let lastRippleTime = 0;
    let currentLoreTimer = null;

    function createGeoParticles() {
        if (geoParticlesCreated) return;
        geoParticlesCreated = true;

        const particleCount = 18;
        const frag = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'geo-particle';

            const size = 4 + Math.random() * 6;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}vw`;
            p.style.top = `${Math.random() * 100}vh`;
            p.style.animationDelay = `${Math.random() * 10}s`;
            p.style.animationDuration = `${10 + Math.random() * 8}s`;

            frag.appendChild(p);
        }

        document.body.appendChild(frag);
    }

    function showLevelLore(text) {
        const oldLore = document.querySelector('.level-lore');
        if (oldLore) oldLore.remove();
        if (currentLoreTimer) clearTimeout(currentLoreTimer);

        const hint = document.createElement('div');
        hint.className = 'level-lore';
        hint.textContent = text;
        document.body.appendChild(hint);

        currentLoreTimer = setTimeout(() => {
            hint.remove();
        }, 3600);
    }

    function showRipple(x, y) {
        const now = Date.now();
        if (now - lastRippleTime < 90) return;
        lastRippleTime = now;

        const r = document.createElement('div');
        r.className = 'geo-ripple';
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        document.body.appendChild(r);

        setTimeout(() => r.remove(), 900);
    }

    function updateBackground(diff) {
        const body = document.body;
        if (!body.classList.contains('level-theme-3')) return;

        const safeDiff = Number.isFinite(diff) ? Math.max(0, diff) : 30;
        const intensity = Math.max(0, 1 - safeDiff / 30);

        body.style.setProperty('--level3-brightness', (1 + intensity * 0.08).toFixed(3));
        body.style.setProperty('--level3-saturate', (1 + intensity * 0.12).toFixed(3));

        const screen = document.getElementById('gameScreen');
        if (screen) {
            screen.style.filter = `brightness(${1 + intensity * 0.04}) saturate(${1 + intensity * 0.05})`;
        }
    }

    function attachParallax() {
        let ticking = false;

        document.addEventListener('mousemove', (e) => {
            const gameScreen = document.getElementById('gameScreen');
            if (!gameScreen || gameScreen.classList.contains('hidden')) return;
            if (!document.body.classList.contains('level-theme-3')) return;

            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5) * 6;
                const y = (e.clientY / window.innerHeight - 0.5) * 6;

                gameScreen.style.transform =
                    `perspective(1200px) rotateX(${-y * 0.15}deg) rotateY(${x * 0.15}deg)`;

                ticking = false;
            });
        });

        document.addEventListener('mouseleave', () => {
            const gameScreen = document.getElementById('gameScreen');
            if (gameScreen) {
                gameScreen.style.transform = '';
            }
        });
    }

    function attachRippleToCanvas() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        canvas.addEventListener('mousemove', (e) => {
            if (!document.body.classList.contains('level-theme-3')) return;
            if (!(e.buttons & 1)) return;
            showRipple(e.clientX, e.clientY);
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!document.body.classList.contains('level-theme-3')) return;
            const touch = e.touches && e.touches[0];
            if (!touch) return;
            showRipple(touch.clientX, touch.clientY);
        }, { passive: true });
    }

    function enhanceStartLevel() {
        if (typeof window.startLevel !== 'function' || window.__level3EnhancedStartLevel) return;
        window.__level3EnhancedStartLevel = true;

        const originalStartLevel = window.startLevel;

        window.startLevel = function (levelId) {
            const result = originalStartLevel.apply(this, arguments);

            createGeoParticles();

            if (Number(levelId) === 3) {
                showLevelLore('✨ 在晶洞中，相同弦对应的角保持不变...');
            }

            return result;
        };
    }

    function enhanceUpdateDataDisplay() {
        if (typeof window.updateDataDisplay !== 'function' || window.__level3EnhancedDataDisplay) return;
        window.__level3EnhancedDataDisplay = true;

        const originalUpdateDataDisplay = window.updateDataDisplay;

        window.updateDataDisplay = function () {
            const result = originalUpdateDataDisplay.apply(this, arguments);

            try {
                const dataText = document.getElementById('dataDisplay')?.innerText || '';
                const match = dataText.match(/([0-9]+(?:\.[0-9]+)?)\s*°?\s*$/m);
                if (match) {
                    const diff = parseFloat(match[1]);
                    updateBackground(diff);
                }
            } catch (err) {
                console.warn('updateBackground skipped:', err);
            }

            return result;
        };
    }

    function applyLevel3CSSVars() {
        const style = document.createElement('style');
        style.textContent = `
            body.level-theme-3 {
                filter: brightness(var(--level3-brightness, 1)) saturate(var(--level3-saturate, 1));
            }
        `;
        document.head.appendChild(style);
    }

    function initLevel3Enhancement() {
        createGeoParticles();
        attachParallax();
        attachRippleToCanvas();
        enhanceStartLevel();
        enhanceUpdateDataDisplay();
        applyLevel3CSSVars();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLevel3Enhancement);
    } else {
        initLevel3Enhancement();
    }
})();