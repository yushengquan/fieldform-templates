// 邮箱墙提交转发服务：浏览器 POST → 本 Worker → 转发 FormSubmit → 邮件到 163
// 部署: npx wrangler deploy --name fieldform-lead --compatibility-date 2026-10-03 worker/lead.js
const TARGET = "https://formsubmit.co/ajax/yushengquanem@163.com";

export default {
  async fetch(request) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") {
      return new Response("ok", { headers });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: "false", message: "POST only" }), { status: 405, headers });
    }
    try {
      const body = await request.json();
      const r = await fetch(TARGET, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: String(body.email || ""),
          template: String(body.template || ""),
          format: String(body.format || ""),
          _subject: "FieldForm template download: " + (body.template || "") + " (" + (body.format || "") + ")",
          _template: "table",
          _captcha: "false",
          _honey: String(body._honey || ""),
        }),
      });
      const text = await r.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // FormSubmit 临时故障（如 522 网关超时）时返回友好提示，用户重试即可
        data = { success: "false", message: "Email service is busy - please try again in a moment." };
      }
      return new Response(JSON.stringify(data), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ success: "false", message: String(e) }), { headers });
    }
  },
};
