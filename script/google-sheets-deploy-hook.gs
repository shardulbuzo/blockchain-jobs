const DEPLOY_HOOK_URL = "https://api.vercel.com/v1/integrations/deploy/prj_Fy8we5r8O6Q84c3kRysWYhrAKlOV/E9BiVUalta";

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
