const DEPLOY_HOOK_URL = "PASTE_YOUR_VERCEL_DEPLOY_HOOK_URL_HERE";

function onEdit(e) {
  triggerDeploy_();
}

function onChange(e) {
  triggerDeploy_();
}

function triggerDeploy_() {
  if (!DEPLOY_HOOK_URL || DEPLOY_HOOK_URL.includes("PASTE_")) return;
  UrlFetchApp.fetch(DEPLOY_HOOK_URL, {
    method: "post",
    muteHttpExceptions: true,
  });
}
