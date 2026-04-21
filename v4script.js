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

    function renderLevelGrid(){
        levelGrid.innerHTML='';
        levelConfig.forEach((level,idx)=>{
            const levelData=gameData.levels[idx];
            const isUnlocked=level.id<=gameData.unlockedLevel;
            const card=document.createElement('div');
            card.className=`level-card ${isUnlocked?'':'locked'}`;
            card.innerHTML=`<div class="level-number">${level.id}</div><div class="level-name">${level.name[currentLang]}</div><div class="level-stars">${'⭐'.repeat(levelData.stars)}${'☆'.repeat(3-levelData.stars)}</div>${!isUnlocked?'<div class="lock-icon">🔒</div>':''}`;
            if(isUnlocked) card.addEventListener('click',()=>startLevel(level.id));
            levelGrid.appendChild(card);
        });
    }

    function startLevel(levelId){
        enableAudio();
        currentLevel=levelId;
        levelScore=0;
        interactionCount=0;
        challengeProgress={stage1:false,stage2:false,stage3:false,stage4:false};
        const level=levelConfig[levelId-1];
        levelPoints=level.initPoints();
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
    function drawPoints(){
        Object.values(levelPoints).forEach(p=>{
            ctx.beginPath();
            ctx.arc(p.x,p.y,8,0,Math.PI*2);
            ctx.fillStyle=p.fixed?'#666':(p===draggingPoint?'#f72585':'#3a0ca3');
            ctx.fill();
            ctx.fillStyle='#000';
            ctx.fillText(p.name,p.x+12,p.y-10);
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
        if(!challengeProgress.stage1 && level.checkStage1()){ challengeProgress.stage1=true; addScore(15,"阶段1完成！+15"); }
        if(!challengeProgress.stage2 && level.checkStage2()){ challengeProgress.stage2=true; addScore(15,"阶段2完成！+15"); }
        if(!challengeProgress.stage3 && level.checkStage3()){ challengeProgress.stage3=true; addScore(15,"阶段3完成！+15"); }
        if(!challengeProgress.stage4 && level.checkStage4()){ challengeProgress.stage4=true; addScore(15,"阶段4完成！+15"); }
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
    canvas.addEventListener('mousemove',(e)=>{ if(!draggingPoint) return; let m=getCanvasCoords(e); interactionCount++; if(currentLevel===5 && draggingPoint.name==='P'){ draggingPoint.x=m.x; draggingPoint.y=m.y; } else { let ang=Math.atan2(m.y-circle.y,m.x-circle.x); draggingPoint.x=circle.x+circle.radius*Math.cos(ang); draggingPoint.y=circle.y+circle.radius*Math.sin(ang); } if(interactionCount%10===0 && levelScore<80) addScore(1,"+1"); draw(); });
    canvas.addEventListener('mouseup',()=>{ draggingPoint=null; });
    canvas.addEventListener('touchstart',(e)=>{ e.preventDefault(); let touch=e.touches[0]; let m=getCanvasCoords(touch); for(let p of Object.values(levelPoints)){ if(!p.fixed && getDistance(m,p)<20){ draggingPoint=p; break; } } },{passive:false});
    canvas.addEventListener('touchmove',(e)=>{ e.preventDefault(); if(!draggingPoint) return; let touch=e.touches[0]; let m=getCanvasCoords(touch); interactionCount++; if(currentLevel===5 && draggingPoint.name==='P'){ draggingPoint.x=m.x; draggingPoint.y=m.y; } else { let ang=Math.atan2(m.y-circle.y,m.x-circle.x); draggingPoint.x=circle.x+circle.radius*Math.cos(ang); draggingPoint.y=circle.y+circle.radius*Math.sin(ang); } if(interactionCount%10===0 && levelScore<80) addScore(1,"+1"); draw(); },{passive:false});
    canvas.addEventListener('touchend',(e)=>{ e.preventDefault(); draggingPoint=null; });

    submitBtn.addEventListener('click',()=>{
        const level=levelConfig[currentLevel-1];
        const isComplete=level.checkComplete();
        const isPrecise=level.checkPrecision();
        if(!isComplete){ aiHintBox.textContent=langPack[currentLang].tryAgain; aiHintBox.classList.remove('hidden'); setTimeout(()=>aiHintBox.classList.add('hidden'),3000); playBeep(400,300); return; }
        let finalScore=60; if(interactionCount>=20) finalScore+=20; if(isPrecise) finalScore+=20;
        levelScore=finalScore; currentScore.textContent=`🎯 得分：${levelScore}`;
        let stars=1; if(finalScore>=80) stars=2; if(finalScore>=95) stars=3;
        levelStar.textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
        const levelData=gameData.levels[currentLevel-1];
        if(finalScore>levelData.score){ gameData.totalScore+=(finalScore-levelData.score); levelData.score=finalScore; levelData.stars=stars; }
        if(currentLevel<levelConfig.length && currentLevel>=gameData.unlockedLevel) gameData.unlockedLevel=currentLevel+1;
        saveGameData(); updateTotalScore();
        resultTitle.textContent=langPack[currentLang].levelComplete; resultStar.textContent='⭐'.repeat(stars); resultScore.textContent=`最终得分：${finalScore} / 100`; resultDesc.textContent=langPack[currentLang].greatJob; nextLevelBtn.style.display=currentLevel<levelConfig.length?'inline-block':'none'; resultModal.classList.remove('hidden'); playBeep(1200,200);
        updateFooterLanguage();
        renderAchievements();
    });

    resetLevelBtn.addEventListener('click',()=>{ startLevel(currentLevel); });
    backBtn.addEventListener('click',()=>{ gameScreen.classList.add('hidden'); levelSelect.classList.remove('hidden'); renderLevelGrid(); });
    nextLevelBtn.addEventListener('click',()=>{ resultModal.classList.add('hidden'); if(currentLevel<levelConfig.length) startLevel(currentLevel+1); else { gameScreen.classList.add('hidden'); levelSelect.classList.remove('hidden'); renderLevelGrid(); } });
    backToSelectBtn.addEventListener('click',()=>{ resultModal.classList.add('hidden'); gameScreen.classList.add('hidden'); levelSelect.classList.remove('hidden'); renderLevelGrid(); });
    aiHintBtn.addEventListener('click',()=>{ const level=levelConfig[currentLevel-1]; let hintText=''; if(currentLevel===5){ if(!challengeProgress.stage1) hintText=level.hint[currentLang].stage1; else if(!challengeProgress.stage2) hintText=level.hint[currentLang].stage2; else if(!challengeProgress.stage3) hintText=level.hint[currentLang].stage3; else hintText=level.hint[currentLang].stage4; } else { hintText=level.hint[currentLang]; } aiHintBox.textContent=hintText; aiHintBox.classList.remove('hidden'); setTimeout(()=>aiHintBox.classList.add('hidden'),6000); });
    howToPlayBtn.addEventListener('click',()=>{ updateRuleContent(); ruleModal.classList.remove('hidden'); });
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