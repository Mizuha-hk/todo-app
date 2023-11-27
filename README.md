# Static Web Appによる最小構成のWebアプリ

## 環境構築

### Node.js

Node.jsはWeb開発において広く使われていますが，バージョン管理が非常に面倒です．
(共同開発でバージョンが合わないなど...)

そこで，Voltaというツールを使用してバージョンを管理していきます．

また，パッケージの管理は`pnpm`を使用します．

#### Volta のインストール

公式の[Geting Started](https://docs.volta.sh/guide/getting-started)に従って環境構築を行います．

voltaのインストールコマンド
```bash
curl https://get.volta.sh | bash
```

**インストールの確認**

まず，ターミナルを再起動します．

次に，パスが通っているか確認します．確認するには，次のコマンドを実行し，`.bashrc` の中身を確認します．
```bash
cat .bashrc
```
パスが通っていると，`.bashrc`にこの2行が追加されているはずです．
```bashrc
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```
無い場合は，手動で編集して追加しましょう．

最後に，voltaのバージョンを確認するコマンドを実行して，インストールされているか確認します．
```bash
volta -v
```
**出力**
```
1.1.1
```

このようにバージョンが出力された場合はインストール完了です．

---

#### Node.jsのインストール

```bash
volta install node
```
**出力**
```bash
success: installed and set node@20.10.0 (with npm@10.2.3) as default
```
これでNode.jsの最新バージョンがインストールされます．

**バージョンの指定する場合**
```bash
volta install node@19
                   ~~ バージョン指定
```

**インストール確認**

```bash
node -v
```

**出力**
```
20.10.0
```
バージョンが確認出来たら，インストール完了です．

#### pnpm のインストール

```bash
volta install pnpm
```
**出力**
```bash
success: installed pnpm@8.11.0 with executables: pnpm, pnpx
```
**インストールの確認**
```bash
pnpm -v
```
**出力**
```
8.11.0
```

### Azure Functions Core Tool

```bash
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
```
```bash
sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
```
```bash
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" > /etc/apt/sources.list.d/dotnetdev.list'
```
```bash
sudo apt-get update
```
```bash
sudo apt-get install azure-functions-core-tools-4
```
**インストールの確認**
```bash
func -v
```
**出力**
```bash
4.0.5455
```

### .NET SDK
```bash
sudo apt-get update
```
```bash
sudo apt-get install -y dotnet-sdk-8.0
```

### Static Web Apps CLI

```bash
npm install -g @azure/static-web-apps-cli
```

```bash
swa -version
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

1.1.6
```

## プロジェクト作成

### Vite + React.js + TypeScript

```bash
pnpm create vite@latest
```

**出力**
```bash
.../share/pnpm/store/v3/tmp/dlx-3249     |   +1 +
.../share/pnpm/store/v3/tmp/dlx-3249     | Progress: resolved 1, reused 1, downloaded 0, added 1, done
✔ Project name: … client
✔ Select a framework: › React
✔ Select a variant: › TypeScript + SWC

Scaffolding project in /home/<yourName>/.../todo-app/client...

Done. Now run:

  cd client
  pnpm install
  pnpm run dev
```

### Azure Functions (C#)
```bash
makdir api
cd api
```
```bash
func init
```

**出力**
```bash
Select a number for worker runtime:
1. dotnet
2. dotnet (isolated process)
3. node
4. python
5. powershell
6. custom
Choose option: 1
dotnet
Select anumber for language:
1. c#
2. f#
Choose option: 1
c#

Writing /home/<yourName>/.../todo-app/api/.vscode/extentions.json
```
サンプルのapiを生成する
```bash
func new
```

**出力**
```bash
Select a number for template:
1. QueueTrigger
2. HttpTrigger
3. BlobTrigger
4. TimerTrigger
5. KafkaTrigger
6. KafkaOutput
7. DurableFunctionsOrchestration
8. SendGrid
9. EventHubTrigger
10. ServiceBusQueueTrigger
11. ServiceBusTopicTrigger
12. EventGridTrigger
13. CosmosDBTrigger
14. IotHubTrigger
15. DaprPublishOutputBinding
16. DaprServiceInvocationTrigger
17. DaprTopicTrigger
Choose option: 2
Function name: SampleFunction
SampleFunction

Creating dotnet function...
The function "SampleFunction" was created successfully from the "HttpTrigger" template.
```

### Static Web Apps CLI

```bash
swa init
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

✔ Choose a configuration name: … todo-app

Detected configuration for your app:
- Framework(s): Vite, with API: .NET, .NET
- App location: client
- Output location: dist
- API location: api
- API language: dotnetisolated
- API version: 6.0
- Data API location: 
- App build command: npm run build
- API build command: dotnet publish -c Release
- App dev server command: npm run dev
- App dev server URL: http://localhost:5173

- API dev server URL: 

✔ Are these settings correct? … yes

Configuration successfully saved to swa-cli.config.json.

Get started with the following commands:
- Use swa start to run your app locally.
- Use swa build to build your app.
- Use swa deploy to deploy your app to Azure.
```

**swa-cli.config.json**
```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "todo-app": {
      "appLocation": "client",
      "apiLocation": "api",
      "outputLocation": "dist",
      "apiLanguage": "dotnetisolated",
      "apiVersion": "6.0",
      "appBuildCommand": "npm run build",
      "apiBuildCommand": "dotnet publish -c Release",
      "run": "npm run dev",
      "appDevserverUrl": "http://localhost:5173"
    }
  }
}
```