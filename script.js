let availableVoices = [];

function populateVoiceOptions() {
  availableVoices = speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));

  const voiceSelect = $("#voiceSelect");
  voiceSelect.empty();

  availableVoices.forEach((voice, index) => {
    const label = `${voice.name} (${voice.lang})`;
    voiceSelect.append(`<option value="${index}">${label}</option>`);
  });
}

function speakText(text) {
  const voiceIndex = parseInt($("#voiceSelect").val());
  const speed = parseFloat($("#speedSelect").val());
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.voice = availableVoices[voiceIndex] || null;
  utterance.rate = speed;

  speechSynthesis.speak(utterance);
}

function loadTopics() {
  $.get(`topics.txt?v=${Date.now()}`, function(data) {  
    const topics = data.split("\n").map(t => t.trim()).filter(Boolean);
    topics.forEach(topic => {
      $("#topicSelect").append(`<option value="${topic}">${topic.charAt(0).toUpperCase() + topic.slice(1)}</option>`);
    });
  });
}

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

// Reload page if timestamp is stale
(function () {
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v');

  if (v) {
    const now = Date.now();
    const vTime = parseInt(v, 10);
    const timeDiff = now - vTime;

    if (isNaN(vTime) || timeDiff > 5000) {
      const url = new URL(window.location.href);
      url.searchParams.set('v', now);
      window.location.replace(url.toString());
    }
  } else {
    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now());
    window.location.replace(url.toString());
  }
})();

$(document).ready(function () {
  // Wait for voices to be available
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceOptions;
  } else {
    setTimeout(populateVoiceOptions, 500);
  }

  loadTopics();

  $("#topicSelect").change(function () {
    const selectedTopic = $(this).val();
    if (selectedTopic) {
      loadQuestions(selectedTopic);
    }
  });
});