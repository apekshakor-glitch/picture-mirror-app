"""Update app.js in both repositories to support 24-hour S3 challenge image reuse."""

import os

paths = [
    r"D:\DARI\dariai-picture-mirror\www\app.js",
    r"D:\DARI\dariai_arcadegame_mobileapp\www\app.js"
]

for p in paths:
    if not os.path.exists(p):
        print(f"Skipping {p} (not found)")
        continue

    with open(p, "r", encoding="utf-8") as f:
        content = f.read()

    content_norm = content.replace("\r\n", "\n")

    target_start_round = (
        '  el("challenge-loading-text").textContent = "Writing today\'s challenge…";\n'
        '  el("challenge-loading").hidden = false;\n'
        '  state.hiddenPrompt = await getHiddenPrompt(state.level);\n\n'
        '  await generateChallengeImage();'
    )

    replacement_start_round = (
        '  el("challenge-loading-text").textContent = "Checking challenge archive (>24h)...";\n'
        '  el("challenge-loading").hidden = false;\n\n'
        '  // 1. Check if a challenge image saved more than 24 hours ago exists in S3\n'
        '  let reusedChallenge = null;\n'
        '  try {\n'
        '    const checkRes = await fetch(`/api/challenges/next?level=${state.level}`);\n'
        '    if (checkRes.ok) {\n'
        '      const checkData = await checkRes.json();\n'
        '      if (checkData.reused && checkData.image_url) {\n'
        '        reusedChallenge = checkData;\n'
        '      }\n'
        '    }\n'
        '  } catch (err) {\n'
        '    console.warn("[DaRI Arcade] Could not check reusable challenge archive:", err);\n'
        '  }\n\n'
        '  if (reusedChallenge) {\n'
        '    console.log("[DaRI Arcade] Reusing challenge image from S3 (>24 hours old):", reusedChallenge.challenge_id);\n'
        '    state.hiddenPrompt = reusedChallenge.hidden_prompt;\n'
        '    state.originalImage = { kind: "url", value: reusedChallenge.image_url };\n'
        '    el("challenge-image").src = reusedChallenge.image_url;\n'
        '    el("challenge-image-wrap").hidden = false;\n'
        '    el("challenge-form").hidden = false;\n'
        '    el("challenge-loading").hidden = true;\n'
        '    return;\n'
        '  }\n\n'
        '  // 2. If no image was saved before 24 hours, generate a fresh challenge image\n'
        '  console.log("[DaRI Arcade] No image >24h old found in S3. Generating fresh challenge image...");\n'
        '  el("challenge-loading-text").textContent = "Writing today\'s challenge…";\n'
        '  state.hiddenPrompt = await getHiddenPrompt(state.level);\n\n'
        '  await generateChallengeImage();'
    )

    target_gen_img = (
        '    state.originalImage = img;\n'
        '    el("challenge-image").src = imgSrc(img);\n'
        '    el("challenge-image-wrap").hidden = false;\n'
        '    el("challenge-form").hidden = false;'
    )

    replacement_gen_img = (
        '    state.originalImage = img;\n'
        '    el("challenge-image").src = imgSrc(img);\n'
        '    el("challenge-image-wrap").hidden = false;\n'
        '    el("challenge-form").hidden = false;\n\n'
        '    // Asynchronously upload only the original challenge image to S3 (eligible for reuse after 24 hours)\n'
        '    uploadOriginalChallengeImageToS3(state.hiddenPrompt, img, state.level);'
    )

    helper_code = (
        '\nasync function uploadOriginalChallengeImageToS3(prompt, img, level) {\n'
        '  try {\n'
        '    console.log("[DaRI Arcade] Uploading original challenge image to S3 (eligible for reuse after 24h)...");\n'
        '    const payload = {\n'
        '      prompt: prompt,\n'
        '      level: level || 1,\n'
        '      image_url: img.kind === "url" ? img.value : null,\n'
        '      image_b64: img.kind === "b64" ? img.value : null,\n'
        '    };\n'
        '    const res = await fetch("/api/challenges/upload", {\n'
        '      method: "POST",\n'
        '      headers: { "Content-Type": "application/json" },\n'
        '      body: JSON.stringify(payload),\n'
        '    });\n'
        '    if (res.ok) {\n'
        '      const data = await res.json();\n'
        '      console.log("[DaRI Arcade] Original challenge image saved to S3 successfully:", data.s3_key);\n'
        '    } else {\n'
        '      console.warn("[DaRI Arcade] S3 challenge upload returned non-200:", res.status);\n'
        '    }\n'
        '  } catch (err) {\n'
        '    console.warn("[DaRI Arcade] Failed to upload challenge image to S3:", err);\n'
        '  }\n'
        '}\n'
    )

    if target_start_round in content_norm and target_gen_img in content_norm:
        content_norm = content_norm.replace(target_start_round, replacement_start_round, 1)
        content_norm = content_norm.replace(target_gen_img, replacement_gen_img, 1)
        content_norm = content_norm.replace('function showChallengeError(msg) {', helper_code + '\nfunction showChallengeError(msg) {', 1)
        content_final = content_norm.replace('\n', '\r\n')
        with open(p, "w", encoding="utf-8") as f:
            f.write(content_final)
        print(f"Updated {p} successfully!")
    else:
        print(f"Target blocks not found in {p}")

