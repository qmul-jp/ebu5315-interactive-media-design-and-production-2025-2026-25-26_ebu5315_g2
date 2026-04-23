// Global naming with underscore case, matching assignment requirements.
const theme_color = "#0d3273";
const sub_color = "#4471c2";
const highlight_color = "#e8a0bf";
const bg_color = "#ffffff";
const bg_color_night = "#150936";

let is_high_contrast = false;
let is_zh = true;

const rules_data = {
  zh: [
    {
      title: "切线垂直半径",
      text: "在切点处，切线与该点半径成直角，可用来快速判断 90° 关系。"
    },
    {
      title: "同圆等弦等角",
      text: "同一圆内，相等的弦对应相等的圆心角，反过来也成立。"
    },
    {
      title: "圆周角定理",
      text: "同弧所对的圆周角相等，且圆周角等于对应圆心角的一半。"
    },
    {
      title: "面积与半径",
      text: "圆面积公式 A = pi * r^2，半径翻倍时面积变为原来的四倍。"
    }
  ],
  en: [
    {
      title: "Tangent and Radius",
      text: "At the tangent point, tangent and radius are perpendicular, giving a direct 90-degree cue."
    },
    {
      title: "Equal Chords, Equal Angles",
      text: "In the same circle, equal chords subtend equal central angles, and vice versa."
    },
    {
      title: "Inscribed Angle Rule",
      text: "Inscribed angles standing on the same arc are equal and each is half of the central angle."
    },
    {
      title: "Area and Radius",
      text: "A = pi * r^2. If radius doubles, area becomes four times larger."
    }
  ]
};

let rule_index = 0;

function apply_mode() {
  document.body.classList.toggle("high-contrast", is_high_contrast);
  const modeBtn = document.getElementById("toggle_mode");
  if (modeBtn) {
    modeBtn.textContent = is_high_contrast ? "☀️" : "🌙";
  }
  const mode_label = document.getElementById("mode_label");
  if (mode_label) {
    mode_label.textContent = is_high_contrast ? (is_zh ? "高对比度" : "High Contrast") : (is_zh ? "标准模式" : "Standard");
  }
  
  // 更新 Canvas 颜色
  if (typeof window.updateCanvasContrast === 'function') {
    window.updateCanvasContrast(is_high_contrast);
  }
}

function render_rule() {
  const title = document.getElementById("rule_title");
  const text = document.getElementById("rule_text");
  const counter = document.getElementById("rule_counter");
  if (!title || !text || !counter) {
    return;
  }

  const list = is_zh ? rules_data.zh : rules_data.en;
  const item = list[rule_index];
  title.textContent = item.title;
  text.textContent = item.text;
  counter.textContent = `${rule_index + 1} / ${list.length}`;
}

function toggle_language() {
  is_zh = !is_zh;
  document.querySelectorAll("[data-zh][data-en]").forEach((node) => {
    node.textContent = is_zh ? node.dataset.zh : node.dataset.en;
  });
  const lang_label = document.getElementById("lang_label");
  if (lang_label) {
    lang_label.textContent = is_zh ? "中文" : "English";
  }
  render_rule();
  
  if (typeof window.updateGameLanguage === 'function') {
    window.updateGameLanguage(is_zh);
  }
  
  // 触发语言改变事件
  const languageChangeEvent = new CustomEvent('languageChanged', {
    detail: { lang: is_zh ? 'zh' : 'en' }
  });
  document.dispatchEvent(languageChangeEvent);
}

function bind_common_actions() {
  const mode_btn = document.getElementById("toggle_mode");
  const lang_btn = document.getElementById("toggle_lang");

  if (mode_btn) {
    mode_btn.addEventListener("click", () => {
      is_high_contrast = !is_high_contrast;
      apply_mode();
    });
  }

  if (lang_btn) {
    lang_btn.addEventListener("click", toggle_language);
  }

  const prev_btn = document.getElementById("prev_rule");
  const next_btn = document.getElementById("next_rule");
  if (prev_btn && next_btn) {
    prev_btn.addEventListener("click", () => {
      const list = is_zh ? rules_data.zh : rules_data.en;
      rule_index = (rule_index - 1 + list.length) % list.length;
      render_rule();
    });

    next_btn.addEventListener("click", () => {
      const list = is_zh ? rules_data.zh : rules_data.en;
      rule_index = (rule_index + 1) % list.length;
      render_rule();
    });
  }
}

function bind_home_form() {
  const form = document.getElementById("contact_form");
  const result = document.getElementById("contact_status");
  if (!form || !result) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    result.textContent = is_zh
      ? "提交成功：感谢你的建议，我们会用于后续规则与题目优化。"
      : "Submitted: Thanks for your suggestion. We will use it in later updates.";
    result.className = "status_ok";
    form.reset();
  });
}

function bind_game_page() {
  const check_btn = document.getElementById("check_game_answer");
  const answer = document.getElementById("game_answer");
  const output = document.getElementById("game_result");
  if (!check_btn || !answer || !output) {
    return;
  }

  check_btn.addEventListener("click", () => {
    if (answer.value === "90") {
      output.textContent = is_zh
        ? "回答正确：切线与过切点半径互相垂直。"
        : "Correct: tangent and radius at the tangent point are perpendicular.";
      output.className = "status_ok";
      return;
    }
    output.textContent = is_zh
      ? "再想想：从切点连接圆心，可以得到一个标准直角关系。"
      : "Try again: connecting tangent point to center gives a right-angle relation.";
    output.className = "status_bad";
  });
}

function bind_quiz_page() {
  const submit_btn = document.getElementById("submit_quiz");
  const output = document.getElementById("quiz_result");
  if (!submit_btn || !output) {
    return;
  }

  submit_btn.addEventListener("click", () => {
    let score = 0;
    const q1 = document.querySelector("input[name='q1']:checked");
    const q2 = document.querySelector("input[name='q2']:checked");
    const q3 = document.getElementById("q3");

    if (q1 && q1.value === "b") {
      score += 1;
    }
    if (q2 && q2.value === "a") {
      score += 1;
    }
    if (q3 && Number(q3.value) === 4) {
      score += 1;
    }

    output.textContent = is_zh
      ? `本次得分：${score} / 3`
      : `Score: ${score} / 3`;
    output.className = score >= 2 ? "status_ok" : "status_bad";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // expose global variables for quick teacher inspection.
  window.circle_lab_globals = {
    theme_color,
    sub_color,
    highlight_color,
    bg_color,
    bg_color_night,
    get is_night() {
      return is_night;
    }
  };

  bind_common_actions();
  apply_mode();
  render_rule();
  bind_home_form();
  bind_game_page();
  bind_quiz_page();
});
