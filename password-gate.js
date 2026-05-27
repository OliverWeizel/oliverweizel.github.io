// Password gate — soft access gate for pre-launch testing.
// Remove this file (and the gate <style>/<script> block in each HTML <head>,
// and the "Password gate" rules at the bottom of style.css) when going public.
//
// Note: this is not real security. The HTML is still served as-is from
// GitHub Pages, so anyone who fetches the raw file or inspects the page
// source can bypass the gate.

(function () {
  "use strict";

  var STORAGE_KEY = "site-unlocked-v1";
  // sha256("bigchungus")
  var PASSWORD_HASH =
    "fd67fa64f85bd2e98a90beb02a415580ad787f082156c6d8e32bb10382b98c96";

  function unlock() {
    document.documentElement.classList.remove("gated");
  }

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      unlock();
      return;
    }
  } catch (e) {
    // sessionStorage unavailable — show the gate.
  }

  function showGate() {
    document.body.innerHTML = "";
    unlock();

    var gate = document.createElement("main");
    gate.id = "gate";
    gate.innerHTML =
      '<form id="gate-form" autocomplete="off" novalidate>' +
      '<h1>Password required</h1>' +
      '<p>This site is in development.</p>' +
      '<label for="gate-input">Password</label>' +
      '<input id="gate-input" name="password" type="password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" autofocus>' +
      '<button type="submit">Enter</button>' +
      '<p id="gate-error" role="alert" aria-live="polite"></p>' +
      '</form>';
    document.body.appendChild(gate);

    var form = document.getElementById("gate-form");
    var input = document.getElementById("gate-input");
    var errorEl = document.getElementById("gate-error");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sha256(input.value).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          try {
            sessionStorage.setItem(STORAGE_KEY, "1");
          } catch (e) {
            // Fall through; the reload will still succeed but they'll need
            // to re-enter the password on the next navigation.
          }
          location.reload();
        } else {
          errorEl.textContent = "Incorrect password.";
          input.value = "";
          input.focus();
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showGate);
  } else {
    showGate();
  }

  function sha256(str) {
    var buf = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", buf).then(function (hashBuf) {
      var bytes = new Uint8Array(hashBuf);
      var hex = "";
      for (var i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, "0");
      }
      return hex;
    });
  }
})();
