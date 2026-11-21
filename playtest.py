# Playtest + screenshot script for Pasar Malam (run from repo dir).
# Usage: python3 playtest.py [shot|test]
import sys, json, time
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8123/game/index.html"
OUT = "screenshots"

def shot_page(pw, url, path):
    b = pw.chromium.launch(args=[
        "--use-gl=angle", "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader", "--no-sandbox"])
    pg = b.new_page(viewport={"width": 1280, "height": 800})
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(url, timeout=90000)
    pg.wait_for_timeout(2500)
    pg.screenshot(path=path, timeout=90000, animations="disabled")
    b.close()
    return errors

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "test"
    with sync_playwright() as pw:
        if mode == "shot":
            stages = [(0, 3, "1-cover.jpg"), (1, 4, "2-park.jpg"),
                      (2, 2, "3-harbor.jpg"), (3, 5, "4-kitchen.jpg")]
            for stage, found, name in stages:
                errs = shot_page(pw, f"{BASE}?stage={stage}&found={found}", f"{OUT}/{name}")
                print(name, "console errors:", errs if errs else "none")
            return
        # Full playtest: load stage 0, click every diff on the LEFT panel,
        # check counter/score/win overlay; wrong click; hint; keyboard.
        b = pw.chromium.launch(args=[
            "--use-gl=angle", "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader", "--no-sandbox"])
        pg = b.new_page(viewport={"width": 1280, "height": 800})
        errors = []
        pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(BASE, timeout=90000)
        pg.wait_for_timeout(1500)
        # dismiss title overlay
        pg.click("#overlay-btn")
        pg.wait_for_timeout(500)
        box = pg.evaluate("() => { const c = document.getElementById('game'); const r = c.getBoundingClientRect(); return {left: r.left, top: r.top, w: r.width, h: r.height}; }")
        sx = box["w"] / 1260.0
        sy = box["h"] / 500.0
        def click_panel(lx, ly):
            pg.mouse.click(box["left"] + (20 + lx) * sx, box["top"] + (20 + ly) * sy)
            pg.wait_for_timeout(120)
        # wrong click first: panel-local (300,400) is clear of every diff
        t0 = pg.evaluate("() => Math.round(window.__game.state.timeLeft)")
        click_panel(300, 400)
        r = pg.evaluate("() => { const g = window.__game; return {score: g.state.score, found: g.state.found.size, time: Math.round(g.state.timeLeft)}; }")
        print("after wrong click:", json.dumps(r), "time before:", t0)
        assert r["score"] == 0 and r["found"] == 0 and r["time"] <= t0 - 2, "wrong-click penalty wrong"
        # click every diff via canvas coords (left panel)
        diffs = pg.evaluate("() => window.__game.scene().diffs.map(d => ({x: d.x, y: d.y}))")
        print("diffs in scene 0:", len(diffs))
        for d in diffs:
            click_panel(d["x"], d["y"])
        pg.wait_for_timeout(800)
        r = pg.evaluate("() => { const g = window.__game; return {phase: g.state.phase, found: g.state.found.size, score: g.state.score, overlay: !document.getElementById('overlay').classList.contains('hidden'), title: document.getElementById('overlay-title').textContent}; }")
        print("after all diffs:", json.dumps(r))
        assert r["phase"] == "levelClear", "level should clear after all diffs"
        assert r["found"] == len(diffs)
        # next level via overlay button
        pg.click("#overlay-btn")
        pg.wait_for_timeout(500)
        r = pg.evaluate("() => { const g = window.__game; return {scene: g.state.sceneIndex, phase: g.state.phase, found: g.state.found.size}; }")
        print("after next level:", json.dumps(r))
        assert r["scene"] == 1 and r["phase"] == "playing"
        # hint on level 2
        pg.keyboard.press("h")
        pg.wait_for_timeout(300)
        r = pg.evaluate("() => { const g = window.__game; return {hints: g.state.hintsLeft, ring: !!g.state.hintRing}; }")
        print("after hint:", json.dumps(r))
        assert r["hints"] == 2 and r["ring"] is True
        # magnifier toggle
        pg.keyboard.press("m")
        pg.wait_for_timeout(300)
        r = pg.evaluate("() => window.__game.state.magnifier")
        print("magnifier on:", r)
        assert r is True
        # keyboard crosshair: place crosshair on level-2 diff 0, press Enter
        d0 = pg.evaluate("() => { const g = window.__game; const d = g.scene().diffs[0]; return d; }")
        pg.evaluate(f"() => {{ const g = window.__game; g.input.crossX = 20 + {d0['x']}; g.input.crossY = 20 + {d0['y']}; g.input.usingKeys = true; }}")
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(300)
        r = pg.evaluate("() => { const g = window.__game; return {found: g.state.found.size, score: g.state.score}; }")
        print("after keyboard pick:", json.dumps(r))
        assert r["found"] == 1, "keyboard Enter pick failed"
        print("console errors:", errors if errors else "none")
        assert not errors, f"console errors: {errors}"
        b.close()
        print("PLAYTEST OK")

if __name__ == "__main__":
    main()
