import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeVoiceInput,
  parseVoiceCommand,
  executeVoiceCommand,
  ALLOWED_WEBSITES,
} from './voiceNavigation.ts';

test('normalizeVoiceInput cleans text and removes punctuation', () => {
  assert.equal(normalizeVoiceInput('  Open Google!  '), 'open google');
  assert.equal(normalizeVoiceInput('OPEN, YOUTUBE...'), 'open youtube');
  assert.equal(normalizeVoiceInput('Open   ChatGPT???'), 'open chatgpt');
  assert.equal(normalizeVoiceInput(''), '');
  assert.equal(normalizeVoiceInput('Open   Facebook!!'), 'open facebook');
  assert.equal(normalizeVoiceInput('GO TO GMAIL:'), 'go to gmail');
});

test('parses all required English website commands with correct HTTPS URLs', () => {
  // 1. "Open Google" -> https://www.google.com
  const google = parseVoiceCommand('Open Google');
  assert.equal(google.action, 'open_website');
  assert.equal(google.target, 'https://www.google.com');
  assert.equal(google.websiteName, 'Google');
  assert.equal(google.isExternal, true);
  assert.equal(google.language, 'en');
  assert.equal(google.feedback, 'Opening Google');

  // 2. "Open YouTube" -> https://www.youtube.com
  const yt = parseVoiceCommand('Open YouTube');
  assert.equal(yt.action, 'open_website');
  assert.equal(yt.target, 'https://www.youtube.com');
  assert.equal(yt.websiteName, 'YouTube');
  assert.equal(yt.isExternal, true);
  assert.equal(yt.language, 'en');
  assert.equal(yt.feedback, 'Opening YouTube');

  // 3. "Open Gmail" -> https://mail.google.com
  const gmail = parseVoiceCommand('Open Gmail');
  assert.equal(gmail.action, 'open_website');
  assert.equal(gmail.target, 'https://mail.google.com');
  assert.equal(gmail.websiteName, 'Gmail');
  assert.equal(gmail.isExternal, true);
  assert.equal(gmail.language, 'en');
  assert.equal(gmail.feedback, 'Opening Gmail');

  // 4. "Open Wikipedia" -> https://www.wikipedia.org
  const wiki = parseVoiceCommand('Open Wikipedia');
  assert.equal(wiki.action, 'open_website');
  assert.equal(wiki.target, 'https://www.wikipedia.org');
  assert.equal(wiki.websiteName, 'Wikipedia');
  assert.equal(wiki.isExternal, true);
  assert.equal(wiki.language, 'en');
  assert.equal(wiki.feedback, 'Opening Wikipedia');

  // 5. "Open ChatGPT" -> https://chatgpt.com
  const chatgpt = parseVoiceCommand('Open ChatGPT');
  assert.equal(chatgpt.action, 'open_website');
  assert.equal(chatgpt.target, 'https://chatgpt.com');
  assert.equal(chatgpt.websiteName, 'ChatGPT');
  assert.equal(chatgpt.isExternal, true);
  assert.equal(chatgpt.language, 'en');
  assert.equal(chatgpt.feedback, 'Opening ChatGPT');

  // 6. "Open Facebook" -> https://www.facebook.com
  const fb = parseVoiceCommand('Open Facebook');
  assert.equal(fb.action, 'open_website');
  assert.equal(fb.target, 'https://www.facebook.com');
  assert.equal(fb.websiteName, 'Facebook');
  assert.equal(fb.isExternal, true);
  assert.equal(fb.language, 'en');
  assert.equal(fb.feedback, 'Opening Facebook');

  // 7. "Open Instagram" -> https://www.instagram.com
  const insta = parseVoiceCommand('Open Instagram');
  assert.equal(insta.action, 'open_website');
  assert.equal(insta.target, 'https://www.instagram.com');
  assert.equal(insta.websiteName, 'Instagram');
  assert.equal(insta.isExternal, true);
  assert.equal(insta.language, 'en');
  assert.equal(insta.feedback, 'Opening Instagram');
});

test('parses prefix variations: "go to Gmail", "navigate to YouTube", conversational speech', () => {
  const gotoGmail = parseVoiceCommand('go to Gmail');
  assert.equal(gotoGmail.action, 'open_website');
  assert.equal(gotoGmail.target, 'https://mail.google.com');

  const navYt = parseVoiceCommand('navigate to YouTube');
  assert.equal(navYt.action, 'open_website');
  assert.equal(navYt.target, 'https://www.youtube.com');

  const pleaseGoogle = parseVoiceCommand('please open Google');
  assert.equal(pleaseGoogle.action, 'open_website');
  assert.equal(pleaseGoogle.target, 'https://www.google.com');

  const canYouInsta = parseVoiceCommand('can you open Instagram');
  assert.equal(canYouInsta.action, 'open_website');
  assert.equal(canYouInsta.target, 'https://www.instagram.com');
});

test('parses "Open my website" and "go home" as internal home navigation', () => {
  const cmd1 = parseVoiceCommand('Open my website');
  assert.equal(cmd1.action, 'navigate_internal');
  assert.equal(cmd1.target, 'home');
  assert.equal(cmd1.isExternal, false);
  assert.equal(cmd1.feedback, 'Opening AccessAble AI Home');

  const cmd2 = parseVoiceCommand('go home');
  assert.equal(cmd2.action, 'navigate_internal');
  assert.equal(cmd2.target, 'home');
  assert.equal(cmd2.isExternal, false);

  const cmd3 = parseVoiceCommand('navigate home');
  assert.equal(cmd3.action, 'navigate_internal');
  assert.equal(cmd3.target, 'home');

  const cmd4 = parseVoiceCommand('open website');
  assert.equal(cmd4.action, 'navigate_internal');
  assert.equal(cmd4.target, 'home');
});

test('parses Tamil voice commands for website navigation and actions', () => {
  // Google in Tamil
  const gTamil = parseVoiceCommand('Google open pannu');
  assert.equal(gTamil.action, 'open_website');
  assert.equal(gTamil.target, 'https://www.google.com');
  assert.equal(gTamil.language, 'ta');

  // YouTube in Tamil
  const ytTamil = parseVoiceCommand('YouTube open pannu');
  assert.equal(ytTamil.action, 'open_website');
  assert.equal(ytTamil.target, 'https://www.youtube.com');
  assert.equal(ytTamil.language, 'ta');

  // Gmail in Tamil (polite form)
  const gmailTamil = parseVoiceCommand('Gmail open pannunga');
  assert.equal(gmailTamil.action, 'open_website');
  assert.equal(gmailTamil.target, 'https://mail.google.com');
  assert.equal(gmailTamil.language, 'ta');

  // Wikipedia in Tamil
  const wikiTamil = parseVoiceCommand('Wikipedia open pannu');
  assert.equal(wikiTamil.action, 'open_website');
  assert.equal(wikiTamil.target, 'https://www.wikipedia.org');
  assert.equal(wikiTamil.language, 'ta');

  // ChatGPT in Tamil
  const chatgptTamil = parseVoiceCommand('ChatGPT open pannu');
  assert.equal(chatgptTamil.action, 'open_website');
  assert.equal(chatgptTamil.target, 'https://chatgpt.com');
  assert.equal(chatgptTamil.language, 'ta');

  // Facebook in Tamil
  const fbTamil = parseVoiceCommand('Facebook open pannu');
  assert.equal(fbTamil.action, 'open_website');
  assert.equal(fbTamil.target, 'https://www.facebook.com');
  assert.equal(fbTamil.language, 'ta');

  // Instagram in Tamil
  const instaTamil = parseVoiceCommand('Instagram open pannu');
  assert.equal(instaTamil.action, 'open_website');
  assert.equal(instaTamil.target, 'https://www.instagram.com');
  assert.equal(instaTamil.language, 'ta');

  // Scroll down in Tamil
  const scrollTamil = parseVoiceCommand('kizha po');
  assert.equal(scrollTamil.action, 'scroll_down');
  assert.equal(scrollTamil.language, 'ta');

  // Scroll up in Tamil
  const scrollUpTamil = parseVoiceCommand('mela po');
  assert.equal(scrollUpTamil.action, 'scroll_up');
  assert.equal(scrollUpTamil.language, 'ta');

  // Go home in Tamil
  const homeTamil = parseVoiceCommand('veetuku po');
  assert.equal(homeTamil.action, 'navigate_internal');
  assert.equal(homeTamil.target, 'home');
  assert.equal(homeTamil.language, 'ta');

  // Previous page / back in Tamil
  const backTamil = parseVoiceCommand('pinnadi po');
  assert.equal(backTamil.action, 'go_back');
  assert.equal(backTamil.language, 'ta');
});

test('handles safe navigation, scrolling, and assistive actions', () => {
  assert.equal(parseVoiceCommand('scroll down').action, 'scroll_down');
  assert.equal(parseVoiceCommand('page down').action, 'scroll_down');
  assert.equal(parseVoiceCommand('scroll up').action, 'scroll_up');
  assert.equal(parseVoiceCommand('page up').action, 'scroll_up');
  assert.equal(parseVoiceCommand('go to top').action, 'scroll_top');
  assert.equal(parseVoiceCommand('scroll bottom').action, 'scroll_bottom');
  assert.equal(parseVoiceCommand('go back').action, 'go_back');
  assert.equal(parseVoiceCommand('previous page').action, 'go_back');
  assert.equal(parseVoiceCommand('read page').action, 'read_page');
  assert.equal(parseVoiceCommand('padi').action, 'read_page');
  assert.equal(parseVoiceCommand('stop reading').action, 'stop_speech');
  assert.equal(parseVoiceCommand('niruthu').action, 'stop_speech');
  assert.equal(parseVoiceCommand('increase text').action, 'increase_text');
  assert.equal(parseVoiceCommand('perusa aaku').action, 'increase_text');
  assert.equal(parseVoiceCommand('decrease text').action, 'decrease_text');
  assert.equal(parseVoiceCommand('chinnatha aaku').action, 'decrease_text');
  assert.equal(parseVoiceCommand('high contrast').action, 'toggle_contrast');
  assert.equal(parseVoiceCommand('theme mathu').action, 'toggle_contrast');
  assert.equal(parseVoiceCommand('dyslexia font').action, 'toggle_dyslexia');
  assert.equal(parseVoiceCommand('reading ruler').action, 'toggle_ruler');
  assert.equal(parseVoiceCommand('large cursor').action, 'toggle_cursor');
  assert.equal(parseVoiceCommand('reduce motion').action, 'toggle_motion');
  assert.equal(parseVoiceCommand('reset settings').action, 'reset_settings');
  assert.equal(parseVoiceCommand('blind mode').action, 'toggle_mode');
  assert.equal(parseVoiceCommand('low vision mode').action, 'toggle_mode');
  assert.equal(parseVoiceCommand('hearing mode').action, 'toggle_mode');
  assert.equal(parseVoiceCommand('head tracking').action, 'toggle_mode');
  assert.equal(parseVoiceCommand('open toolbar').action, 'open_toolbar');
  assert.equal(parseVoiceCommand('close toolbar').action, 'close_toolbar');
  assert.equal(parseVoiceCommand('shortcuts').action, 'open_shortcuts');
  assert.equal(parseVoiceCommand('help').action, 'open_voice_modal');
  assert.equal(parseVoiceCommand('close').action, 'close_modals');
  assert.equal(parseVoiceCommand('start scan').action, 'trigger_scan');
  assert.equal(parseVoiceCommand('scan pannu').action, 'trigger_scan');
});

test('rejects unsafe commands, malicious script injection, and arbitrary URLs', () => {
  // JavaScript URL injection attempt
  const maliciousJs = parseVoiceCommand('open javascript:alert(1)');
  assert.equal(maliciousJs.action, 'unknown');
  assert.equal(maliciousJs.target, undefined);

  // Data URI injection attempt
  const maliciousData = parseVoiceCommand('open data:text/html,<script>alert(1)</script>');
  assert.equal(maliciousData.action, 'unknown');
  assert.equal(maliciousData.target, undefined);

  // Non-allowlisted external website
  const nonAllowedSite = parseVoiceCommand('open https://malicious-site.com');
  assert.equal(nonAllowedSite.action, 'unknown');
  assert.equal(nonAllowedSite.target, undefined);

  // Shell / eval injection attempt
  const shellAttempt = parseVoiceCommand('rm -rf /');
  assert.equal(shellAttempt.action, 'unknown');

  // Unknown random command
  const unknown = parseVoiceCommand('order pizza and pasta');
  assert.equal(unknown.action, 'unknown');
  assert.equal(unknown.target, undefined);
  assert.match(unknown.feedback, /Command not recognized/);

  // Empty string
  const empty = parseVoiceCommand('');
  assert.equal(empty.action, 'unknown');
  assert.match(empty.feedback, /No command heard/);
});

test('all allowed websites have valid secure HTTPS URLs and required attributes', () => {
  const expectedSites = ['google', 'youtube', 'gmail', 'wikipedia', 'chatgpt', 'facebook', 'instagram'];

  for (const siteId of expectedSites) {
    const site = ALLOWED_WEBSITES[siteId];
    assert.ok(site, `Site ${siteId} must exist in ALLOWED_WEBSITES`);
    assert.ok(site.url.startsWith('https://'), `${siteId} must start with https://`);
    assert.ok(site.name.length > 0);
    assert.ok(site.englishKeywords.length > 0);
    assert.ok(site.tamilKeywords.length > 0);
  }
});

test('executeVoiceCommand correctly invokes corresponding handler callbacks', () => {
  let navigatedTo = '';
  let scrolledDown = false;
  let scrolledUp = false;
  let wentBack = false;

  const handlers = {
    onNavigate: (page: string) => {
      navigatedTo = page;
    },
    onScrollDown: () => {
      scrolledDown = true;
    },
    onScrollUp: () => {
      scrolledUp = true;
    },
    onGoBack: () => {
      wentBack = true;
    },
  };

  // Test internal navigation execution
  const navCmd = parseVoiceCommand('Open my website');
  const navResult = executeVoiceCommand(navCmd, handlers);
  assert.equal(navResult.success, true);
  assert.equal(navigatedTo, 'home');

  // Test scroll down execution
  const scrollDownCmd = parseVoiceCommand('scroll down');
  const scrollDownResult = executeVoiceCommand(scrollDownCmd, handlers);
  assert.equal(scrollDownResult.success, true);
  assert.equal(scrolledDown, true);

  // Test scroll up execution
  const scrollUpCmd = parseVoiceCommand('scroll up');
  const scrollUpResult = executeVoiceCommand(scrollUpCmd, handlers);
  assert.equal(scrollUpResult.success, true);
  assert.equal(scrolledUp, true);

  // Test go back execution
  const backCmd = parseVoiceCommand('go back');
  const backResult = executeVoiceCommand(backCmd, handlers);
  assert.equal(backResult.success, true);
  assert.equal(wentBack, true);

  // Test unknown command execution
  const unknownCmd = parseVoiceCommand('fly to moon');
  const unknownResult = executeVoiceCommand(unknownCmd, handlers);
  assert.equal(unknownResult.success, false);
  assert.match(unknownResult.message, /Command not recognized/);
});

test('parses Google Search voice commands with safe query encoding', () => {
  const search1 = parseVoiceCommand('search google for react accessibility');
  assert.equal(search1.action, 'open_website');
  assert.equal(search1.target, 'https://www.google.com/search?q=react%20accessibility');
  assert.equal(search1.isExternal, true);

  const search2 = parseVoiceCommand('google search python tutorial');
  assert.equal(search2.action, 'open_website');
  assert.equal(search2.target, 'https://www.google.com/search?q=python%20tutorial');

  const searchTamil = parseVoiceCommand('google la weather search pannu');
  assert.equal(searchTamil.action, 'open_website');
  assert.equal(searchTamil.target, 'https://www.google.com/search?q=weather');
  assert.equal(searchTamil.language, 'ta');
});

test('parses and executes hands-free proceed and open_blocked commands', () => {
  assert.equal(parseVoiceCommand('proceed').action, 'open_blocked');
  assert.equal(parseVoiceCommand('open now').action, 'open_blocked');
  assert.equal(parseVoiceCommand('open link').action, 'open_blocked');
  assert.equal(parseVoiceCommand('thira').action, 'open_blocked');
  assert.equal(parseVoiceCommand('ippovae thira').action, 'open_blocked');

  let blockedOpened = false;
  const result = executeVoiceCommand(parseVoiceCommand('proceed'), {
    onNavigate: () => {},
    onOpenBlocked: () => {
      blockedOpened = true;
    },
  });
  assert.equal(result.success, true);
  assert.equal(blockedOpened, true);
});

