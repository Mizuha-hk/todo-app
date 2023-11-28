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
`Node.js`のインストールを行います．Node.jsのインストールには，先ほどインストールした，`Volta`を使用します．

以下のコマンドを実行して，`Node.js`のインストールを行います．
```bash
volta install node
```
**出力**
```bash
success: installed and set node@20.10.0 (with npm@10.2.3) as default
```
これでNode.jsの最新バージョンがインストールされました．

**バージョンの指定する場合**

バージョンを指定する場合は，`node@19`のように，`@`以下にバージョンを追加するとできます．
```bash
volta install node@19
                   ~~ バージョン指定
```

**インストール確認**

以下のコマンドを入力することで，`Node.js`のバージョンを確認します．
```bash
node -v
```

**出力**
```
20.10.0
```
バージョンが確認出来たら，インストール完了です．

---

#### pnpm のインストール

パッケージ管理ツールである`pnpm`をインストールしていきます．
以下紹介するコマンド等は，公式の[ドキュメント](https://pnpm.io/ja/installation)をもとに紹介しています．
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

バージョンが確認出来たら，正常にインストールされています．

---

### Azure Functions Core Tools

Azure Functionsプロジェクトの作成，実行を行うために，`Azure Functions Core Tools`をインストールしていきます．
以下紹介するコマンドは，Microsoftの[公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-csharp)をもとに紹介しています．

まず，WSL上にパッケージの整合性をチェックするための，MicrosoftパッケージリポジトリのGPGキーをインストールします．以下2つのコマンドを順番に実行します．

```bash
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
```
```bash
sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
```
次に，以下のコマンドを実行し，`apt`のソースリストを設定します．
```bash
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" > /etc/apt/sources.list.d/dotnetdev.list'
```
次に，以下のコマンドを実行し，`apt`ソースを更新します．
```bash
sudo apt-get update
```
最後に，以下のコマンドを実行し，`Azure Functions Core Tools`をインストールしてください．
```bash
sudo apt-get install azure-functions-core-tools-4
```
**インストールの確認**

以下のコマンドを実行し，`Azure Functions Core Tools`のバージョンを確認します．
```bash
func -v
```
**出力**
```bash
4.0.5455
```
このように，バージョンが表示されたら，正常にインストールが完了しました．

### .NET SDK

`C#`の`Azure Functions`を実行するために，`.NET SDK`をインストールしていきます．以下紹介するコマンドはMicrosoftの[公式ドキュメント](https://learn.microsoft.com/ja-jp/dotnet/core/install/linux-ubuntu-2204)をもとに紹介しています．

以下の2つのコマンドを順番に実行して，インストールしていきます．

```bash
sudo apt-get update
```
```bash
sudo apt-get install -y dotnet-sdk-8.0
```
これでインストールが完了です．

**インストールの確認**
以下のコマンドを実行して，バージョンを確認していきます．
```bash
dotnet --vertion
```
**出力**
```bash
8.0.100
```
このようにバージョンが表示された場合は，正常にインストール完了です．

### Static Web Apps CLI

clientとapiのつなぎ込みや，認証機能などは，AzureのStatic Web Appsの機能を使用します．そのStatic Web Appsの機能をローカルでデバッグするためのツールが`Atatic Web Apps CLI`です．
以下紹介するコマンドは，公式の[ドキュメント](https://azure.github.io/static-web-apps-cli/docs/use/install/)をもとに紹介しています．

`Static Web Apps CLI`をインストールするには，以下のコマンドを実行します．
```bash
npm install -g @azure/static-web-apps-cli
```

これでインストール完了です．

**インストールの確認**

以下のコマンドを実行して，`Static Web Apps CLI`のバージョンを確認します．
```bash
swa -version
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

1.1.6
```

このように，バージョンが出力されたら，インストール完了です．

### Make (推奨)

今回のプロジェクトは，デバッグに多数のコマンドを使用するため，使用するコマンドをあらかじめ`Makefile`として定義しておくととても便利です．今回のプロジェクトに必須ではありませんが，使用することを推奨します．

インストールするには，次のコマンドを実行してください．

```bash
sudo apt update
```
```bash
sudo apt install make
```

これで`Makefile`を使用することができます．

**インストールの確認**
```bash
make -v
```

**出力**

```bash
GNU Make 4.3
Built for x86_64-pc-linux-gnu
Copyright (C) 1988-2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
```

このようにバージョンが表示された場合は，正常にインストール完了です．

## プロジェクト作成

### プロジェクトの構成

今回は，フロントエンドとして`Vite` + `React.js` + `TypeScript`のプロジェクト，バックエンドとして，`C#`の`Azure Functions`プロジェクトを使用します．

**ディレクトリ構成**
```
todo-app
  ├ api
  │  └ Azure Functionsのプロジェクト
  │
  └ client
     └ Vite + Reactのプロジェクト
```
`todo-app/client`: フロントエンド部分

`todo-app/api`: バックエンド部分

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

最後に，依存関係のインストールを済ませて，実行準備を完了させましょう．

```bash
cd client && pnpm install
```

**出力**
```bash
Downloading registry.npmjs.org/typescript/5.3.2: 5.76 MB/5.76 MB, done
Packages: +156
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Downloading registry.npmjs.org/@swc/core-linux-x64-gnu/1.3.99: 15.40 MB/15.40 MB, done
Downloading registry.npmjs.org/@swc/core-linux-x64-musl/1.3.99: 18.33 MB/18.33 MB, done
Progress: resolved 195, reused 0, downloaded 156, added 156, done
node_modules/.pnpm/@swc+core@1.3.99/node_modules/@swc/core: Running postinstall script, done in 155ms
node_modules/.pnpm/esbuild@0.19.8/node_modules/esbuild: Running postinstall script, done in 132ms

dependencies:
+ react 18.2.0
+ react-dom 18.2.0

devDependencies:
+ @types/react 18.2.39
+ @types/react-dom 18.2.17
+ @typescript-eslint/eslint-plugin 6.13.0
+ @typescript-eslint/parser 6.13.0
+ @vitejs/plugin-react-swc 3.5.0
+ eslint 8.54.0
+ eslint-plugin-react-hooks 4.6.0
+ eslint-plugin-react-refresh 0.4.4
+ typescript 5.3.2
+ vite 5.0.2

The dependency was already listed in devDependencies.
If you want to make it a prod dependency, then move it manually.

Done in 27.9s
```

これで，クライアント側のプロジェクト作成と実行準備が整いました．

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