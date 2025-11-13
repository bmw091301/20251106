// 全域變數
let quizTable;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // 狀態機: START, QUIZ, RESULT

// 特效相關變數
let particles = [];
let feedbackParticles = [];
let selectedOption = { index: -1, correct: false, answered: false };
let feedbackTimer = 0;

// 測驗選項的區域
let optionBoxes = [];

// 預載入資源 (CSV題庫)
function preload() {
  quizTable = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 解析CSV資料並存入 questions 陣列
  for (let row of quizTable.getRows()) {
    let q = row.getString('question');
    let opts = [
      row.getString('optionA'),
      row.getString('optionB'),
      row.getString('optionC'),
      row.getString('optionD')
    ];
    let answer = row.getString('correctAnswer');
    questions.push({
      question: q,
      options: opts,
      answer: answer
    });
  }
  
  textAlign(CENTER, CENTER);
  textSize(24);
}

function draw() {
  background(30, 30, 50); // 深藍色背景

  // 根據遊戲狀態繪製不同畫面
  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUIZ':
      drawQuizScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }
  
  drawCursorEffect();
}

// --- 狀態繪製函數 ---

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(48);
  text('p5.js 測驗系統', width / 2, height / 3);
  
  // 開始按鈕
  let buttonX = width / 2 - 100;
  let buttonY = height / 2;
  let buttonW = 200;
  let buttonH = 50;
  
  // 滑鼠懸停效果
  if (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
    fill(100, 255, 100);
  } else {
    fill(0, 150, 0);
  }
  rect(buttonX, buttonY, buttonW, buttonH, 10);
  
  fill(255);
  textSize(24);
  text('開始測驗', width / 2, height / 2 + 25);
}

function drawQuizScreen() {
  if (currentQuestionIndex >= questions.length) {
    gameState = 'RESULT';
    createResultAnimation();
    return;
  }

  let q = questions[currentQuestionIndex];
  
  // 繪製問題
  fill(255);
  textSize(28);
  rectMode(CENTER); // 將 text() 的 x,y 座標解釋為中心點
  textAlign(CENTER, CENTER);
  text(q.question, width / 2, height / 4, width * 0.8);
  rectMode(CORNER); // 恢復預設的 rectMode，避免影響後續繪圖
  
  // 繪製選項
  optionBoxes = [];
  for (let i = 0; i < q.options.length; i++) {
    let w = width * 0.7;
    let x = (width - w) / 2;
    let y = height / 2 - 20 + i * 60;
    let h = 50;
    optionBoxes.push({ x, y, w, h });

    // 處理滑鼠懸停效果
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h && !selectedOption.answered) {
      fill(150, 150, 200);
    } else {
      fill(80, 80, 120);
    }
    
    // 處理選擇後的回饋效果
    if (selectedOption.answered && selectedOption.index === i) {
      if (selectedOption.correct) {
        fill(0, 200, 0); // 正確答案為綠色
      } else {
        fill(200, 0, 0); // 錯誤答案為紅色
      }
    }
    
    rect(x, y, w, h, 10);
    
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(q.options[i], x + w / 2, y + h / 2);
  }
  
  // 繪製進度
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(200);
  text(`問題 ${currentQuestionIndex + 1} / ${questions.length} | 分數: ${score}`, width / 2, height - 30);
  
  // 回饋計時器
  if (selectedOption.answered) {
    feedbackTimer--;
    if (feedbackTimer <= 0) {
      selectedOption.answered = false;
      currentQuestionIndex++;
    }
  }
}

function drawResultScreen() {
  let percentage = score / questions.length;
  let message = '';
  
  if (percentage >= 0.8) {
    message = '太棒了！你真是個p5.js大師！';
    praiseAnimation();
  } else if (percentage >= 0.5) {
    message = '不錯喔！繼續努力！';
    encourageAnimation();
  } else {
    message = '別灰心，再多練習一下吧！';
    encourageAnimation();
  }
  
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text('測驗結束', width / 2, height / 4);
  
  textSize(32);
  text(`你的分數: ${score} / ${questions.length}`, width / 2, height / 2);
  
  textSize(24);
  text(message, width / 2, height / 2 + 60);

  // 更新與繪製回饋動畫
  for (let i = feedbackParticles.length - 1; i >= 0; i--) {
    let p = feedbackParticles[i];
    p.update();
    p.show();
    if (p.isDead()) {
      feedbackParticles.splice(i, 1);
    }
  }

  // 重新測驗按鈕
  let buttonX = width / 2 - 100;
  let buttonY = height * 0.75;
  let buttonW = 200;
  let buttonH = 50;

  // 滑鼠懸停效果
  if (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
    fill(100, 100, 255); // 懸停時的顏色
  } else {
    fill(0, 0, 150); // 預設顏色
  }
  rect(buttonX, buttonY, buttonW, buttonH, 10);

  fill(255);
  textSize(24);
  text('重新測驗', width / 2, height * 0.75 + 25);
}

// --- 互動函數 ---

function mousePressed() {
  // 處理開始畫面的點擊
  if (gameState === 'START') {
    let buttonX = width / 2 - 100;
    let buttonY = height / 2;
    let buttonW = 200;
    let buttonH = 50;
    if (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
      gameState = 'QUIZ';
    }
  } 
  // 處理測驗中的選項點擊
  else if (gameState === 'QUIZ' && !selectedOption.answered) {
    for (let i = 0; i < optionBoxes.length; i++) {
      let b = optionBoxes[i];
      if (mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h) {
        checkAnswer(i);
        break;
      }
    }
  }
  // 處理結果畫面的點擊 (重新開始)
  else if (gameState === 'RESULT') {
    let buttonX = width / 2 - 100;
    let buttonY = height * 0.75;
    let buttonW = 200;
    let buttonH = 50;
    if (mouseX > buttonX && mouseX < buttonX + buttonW && mouseY > buttonY && mouseY < buttonY + buttonH) {
      // 重置測驗狀態
      currentQuestionIndex = 0;
      score = 0;
      feedbackParticles = [];
      gameState = 'START';
    }
  }
}

function checkAnswer(selectedIndex) {
  let q = questions[currentQuestionIndex];
  let isCorrect = q.options[selectedIndex] === q.answer;
  
  if (isCorrect) {
    score++;
  }
  
  selectedOption = { index: selectedIndex, correct: isCorrect, answered: true };
  feedbackTimer = 60; // 顯示回饋1秒 (60幀)
  
  // 點擊特效
  createSelectionEffect(optionBoxes[selectedIndex].x + optionBoxes[selectedIndex].w / 2, 
                        optionBoxes[selectedIndex].y + optionBoxes[selectedIndex].h / 2, 
                        isCorrect);
}

// --- 特效與動畫 ---

function drawCursorEffect() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

function mouseMoved() {
  for (let i = 0; i < 2; i++) {
    particles.push(new Particle(mouseX, mouseY, color(255, 255, 0, 150)));
  }
}

function createSelectionEffect(x, y, isCorrect) {
  let c = isCorrect ? color(0, 255, 0) : color(255, 0, 0);
  for (let i = 0; i < 30; i++) {
    feedbackParticles.push(new Particle(x, y, c, true));
  }
}

function createResultAnimation() {
  let percentage = score / questions.length;
  if (percentage >= 0.8) {
    // 稱讚: 產生一次性的煙火
    for (let i = 0; i < 200; i++) {
      feedbackParticles.push(new Particle(width / 2, height / 2, color(random(255), random(255), random(255)), true));
    }
  } else {
    // 鼓勵: 產生一次性的上升氣泡
    for (let i = 0; i < 100; i++) {
      feedbackParticles.push(new Particle(random(width), height + 20, color(random(100, 255), random(100, 255), 255, 150), false, true));
    }
  }
}

function praiseAnimation() {
  // 持續產生煙火
  if (frameCount % 10 === 0) {
    let x = random(width);
    let y = random(height / 2);
    for (let i = 0; i < 50; i++) {
      feedbackParticles.push(new Particle(x, y, color(random(255), random(255), random(255)), true));
    }
  }
}

function encourageAnimation() {
  // 持續產生上升氣泡
  if (frameCount % 5 === 0) {
    feedbackParticles.push(new Particle(random(width), height + 20, color(random(100, 200), random(100, 200), 255, 150), false, true));
  }
}

// --- 粒子類別 ---

class Particle {
  constructor(x, y, c, explode = false, rise = false) {
    this.pos = createVector(x, y);
    if (explode) {
      this.vel = p5.Vector.random2D().mult(random(1, 6));
    } else if (rise) {
      this.vel = createVector(random(-1, 1), random(-3, -1));
    } else {
      this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    }
    this.acc = createVector(0, 0);
    this.lifespan = 255;
    this.color = c;
    this.isExplosion = explode;
    
    if (this.isExplosion) {
      this.acc = createVector(0, 0.05); // 為爆炸粒子添加重力
    }
  }

  isDead() {
    return this.lifespan < 0;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }

  show() {
    noStroke();
    let c = this.color;
    fill(red(c), green(c), blue(c), this.lifespan);
    ellipse(this.pos.x, this.pos.y, 8);
  }
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
