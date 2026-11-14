# 留学OTA（仮）

航空券込みの総額で留学プランを比較でき、渡航までの残りステップが常に見える、学生向けの留学比較アプリのプロトタイプです。

- `CLAUDE.md`：Claude Code 向けの引き継ぎと次の作業
- `docs/`：事業概要、仕様、TikTok分析、動画制作
- `prototype/`：アプリのプロトタイプ（React 1ファイル、データは架空）
- `video/`：TikTok用15秒動画のプレビュー（ブラウザで開くと再生）
- `assets/`：動画用の元画像

## 動かし方
```bash
npm install
npm run dev
```
本番用のビルドは `npm run build`（`dist/` に出力）。

- `src/App.jsx`：`prototype/ryugaku-ota.jsx` をそのまま移したもの。保存先だけ `window.storage` から `localStorage` に置き換え
- TypeScript・react-router-dom・shadcn/ui への移行（CLAUDE.md の「次にやること」1）はまだ

## Vercel への公開
- Root Directory：`ryugaku-ota`
- Framework Preset：Vite（Build Command `npm run build`、Output Directory `dist` は自動）
