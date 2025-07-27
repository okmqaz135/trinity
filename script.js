(function () {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v');

  if (v) {
    const now = Date.now();
    const vTime = parseInt(v, 10);
    const timeDiff = now - vTime;

    // If timestamp is older than 5 seconds, reload
    if (isNaN(vTime) || timeDiff > 5000) {
      const url = new URL(window.location.href);
      url.searchParams.set('v', now);
      window.location.replace(url.toString());
    }
  } else {
    // If no timestamp, redirect with one
    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now());
    window.location.replace(url.toString());
  }
})();


// Load voice options when available
window.speechSynthesis.onvoiceschanged = () => {
  speechSynthesis.getVoices();
};

// Speak function
function speakText(text) {
  const voiceType = $("#voiceSelect").val();
  const speed = parseFloat($("#speedSelect").val());
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  utterance.voice = voices.find(v =>
    (voiceType === "UK Male" && v.name.includes("Male") && v.lang.includes("en-GB")) ||
    (voiceType === "UK Female" && v.name.includes("Female") && v.lang.includes("en-GB"))
  ) || voices[0];

  utterance.rate = speed;
  speechSynthesis.speak(utterance);
}

// Load topics from topics.txt
function loadTopics() {
  $.get(`topics.txt?v=${Date.now()}`, function(data) {	
    const topics = data.split("\n").map(t => t.trim()).filter(Boolean);
    topics.forEach(topic => {
      $("#topicSelect").append(`<option value="${topic}">${topic.charAt(0).toUpperCase() + topic.slice(1)}</option>`);
    });
  });
}

// Load questions for selected topic
function loadQuestions(topic) {
  $.get(`${topic}.txt?v=${Date.now()}`, function(data) {
    const questions = data.split("\n").map(q => q.trim()).filter(Boolean);
    const container = $("#questionsContainer");
    container.empty();

    questions.forEach(function (q) {
      const box = $("<div>").addClass("questionBox");
      const btnRow = $("<div>").addClass("buttonRow");
      const hiddenText = $("<div>").addClass("hiddenText").text(q);

      const playBtn = $("<button>").text("🔊 Play").click(function () {
        speakText(q);
      });

      const showBtn = $("<button>").text("👁️ Show").click(function () {
        hiddenText.toggle();
        const isVisible = hiddenText.is(":visible");
        $(this).text(isVisible ? "🙈 Hide" : "👁️ Show");
      });

      btnRow.append(playBtn, showBtn);
      box.append(btnRow, hiddenText);
      container.append(box);
    });
  });
}

$(document).ready(function () {
  loadTopics();

  $("#topicSelect").change(function () {
    const selectedTopic = $(this).val();
    if (selectedTopic) {
      loadQuestions(selectedTopic);
    }
  });
});
