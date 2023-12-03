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

### Make

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

`Vite` + `React.js` + `TypeScript`のプロジェクトを作成するには，`/todo-app`ディレクトリで以下のコマンドを実行します．

```bash
pnpm create vite@latest
```
このコマンドを実行すると，`プロジェクト名`, `フレームワーク`，`言語`を問われます．
今回はプロジェクト名を`client`にし，フレームワークは`React`，言語は`TypeScript + SWC`にします．

フレームワークと言語は方向キーで操作し，Enterキーで確定します．

**プロジェクト名**
```bash
?Project name: client
```

**フレームワーク**

```bash
?Select a framework:
    Vanilla
    Vue
>   React
    Preact
    Lit
    Svelte
    Solid
    Qwik
    Others
```

**言語**

```bash
?Select a variant:
    TypeScript
>   TypeScript + SWC
    JavaScript
    JavaScript + SWC
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

Azure Functions のプロジェクトを作成するには，まずプロジェクト用のディレクトリを作成し，ディレクトリを移動します．
```bash
makdir api
cd api
```
次に，以下のコマンドを実行して，プロジェクトを作成します．
```bash
func init
```

実行すると，プロジェクトテンプレートの種類を聞かれるので，該当する数字を入力して作成します．
今回は，ランタイムは`dotnet`，言語は`c#`を選択します．

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
これでプロジェクトの作成は完了です．ただし，この状態では，apiが一切定義されていないので，適当にサンプルのapiを生成します．

以下のコマンドを`/todo-app/api`のディレクトリ下で実行してください．
```bash
func new
```
すると，テンプレートの種類と名前を作成することを要求されます．今回は，テンプレートは`HttpTrigger`，名前は`SampleFunction`とします．

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

これで，サンプルのapiが作成されました．これで実行準備が完了しました．

### Static Web Apps CLI

今回はデバッグに`Static Web Apps CLI`を使用するため，今回のプロジェクトに対して，`Static Web Apps CLI`のセットアップをしていきます．

`/todo-app`ディレクトリ下で以下のコマンドを実行してください．
```bash
swa init
```

すると，設定の名前の入力とアプリの設定を質問されます．このあたりの構成は，現状作っているプロジェクトを参照して，勝手に生成されますが，若干違いもあるので，修正していきます．

まず，設定の名前を質問されますが，既に表示されている`todo-app`という名前で大丈夫です．

次に，アプリの構成を読み取って，設定を自動で生成してくれます．

```bash
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

? Are these settings correct? > (Y/n)
```
ただし，今回は

`API language`は`dotnet`

`App build command`は`pnpm run build`

`App dev server command`は`pnpm run dev`

になるため，`n`を入力して修正していきます．

**API language**
```bash
?What's your API language (optional) > Use arrow-keys. Return to submit.
  Node.js
  Python
> Dotnet
  Dotnet isolated
```

**App build command**
```bash
?What command do you use to build your app? (optional) › pnpm run build
```

**App dev server command**
```bash
? What command do you use to run your app for development? (optional) › pnpm run dev
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

✔ Are these settings correct? … no
✔ What's your app location? … client
✔ What's your build output location? … dist
✔ What's your API location? (optional) … api
✔ What's your API language? (optional) › Dotnet
✔ What's your API version? (optional) › 6.0
✔ What's your data API location? (optional) … 
✔ What command do you use to build your app? (optional) … pnpm run build
✔ What command do you use to build your API? (optional) … dotnet publish -c Release
✔ What command do you use to run your app for development? (optional) … pnpm run dev
✔ What's your app development server URL (optional) … http://localhost:5173
✔ What's your API development server URL (optional) … 
✔ Configuration with name "todo-app" already exists, overwrite? … yes

Configuration successfully saved to swa-cli.config.json.

Get started with the following commands:
- Use swa start to run your app locally.
- Use swa build to build your app.
- Use swa deploy to deploy your app to Azure.
```

ここで設定した構成は，`swa-cli.config.json`に保存されています．

**swa-cli.config.json**
```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "todo-app": {
      "appLocation": "client",
      "apiLocation": "api",
      "outputLocation": "dist",
      "apiLanguage": "dotnet",
      "apiVersion": "6.0",
      "appBuildCommand": "pnpm run build",
      "apiBuildCommand": "dotnet publish -c Release",
      "run": "pnpm run dev",
      "appDevserverUrl": "http://localhost:5173"
    }
  }
}
```

これで，`Static Web Apps CLI`の準備は完了です．

### Makefile

ここまで，おおよそのプロジェクトの作成が完了しました．ではここで実行コマンドを確認しておきましょう．

フロントエンドの起動は`/todo-app/client`ディレクトリ下で次のコマンドで実行できます．

```bash
pnpm run dev
```

バックエンドの起動は`/todo-app/client`ディレクトリ下で次のコマンドで実行できます．

```bash
func start
```

`Static Web Apps CLI`の実行は`/todo-app`ディレクトリ下で次のコマンドで実行できます．

```bash
swa start http://localhost:5173 --api-devserver-url http://localhost:7071
```

この3つのコマンドを実行することになります．いちいち打つのはまぁ超面倒ですよね...

そこで，これらのコマンド`Makefile`に定義していきます．`/todo-app`ディレクトリ下で，`Makefile`という名前のファイルを作り，以下の内容を入力して保存します．

```Makefile
.PHONY: swa client api

swa:
	swa start http://localhost:5173 --api-devserver-url http://localhost:7071

client:
	cd client && pnpm run dev

api:
	cd api && func start 
```

こうすると，

フロントエンドの実行コマンド
```bash
make client
```
バックエンドの実行コマンド
```bash
make api
```
`Static Web Apps CLI`の実行コマンド
```bash
make swa
```

となり，入力がだいぶ楽になります．さらにTabキーで補完ができるのでさらに楽です．

特に`Static Web Apps CLI`は起動コマンドが長いので，このように`Makefile`を書くことを推奨します．

### 実行してみる

それでは，作成したプロジェクトを実行してみましょう．コマンドは`Makefile`で定義したものを使用します．

#### フロントエンド単体で実行
実行コマンド
```bash
make client
```

**出力**
```bash
 VITE v5.0.2  ready in 474 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

`http://localhost:5173`をブラウザで開きます．すると，下の画像のようなサイトに飛ぶことができます．

![default-client](/assets/default-client.png)

これでフロントエンド単体の実行は完了です．サイトの外見だけのチェックであればこれで十分です．

#### バックエンド単体で実行

実行コマンド
```bash
make api
```
**出力**

```bash
MSBuild version 17.8.3+195e7f5a3 for .NET
  Determining projects to restore...
  All projects are up-to-date for restore.
  api -> /home/<yourName>/.../todo-app/api/bin/output/api.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:04.56



Azure Functions Core Tools
Core Tools Version:       4.0.5455 Commit hash: N/A  (64-bit)
Function Runtime Version: 4.27.5.21554

[2023-12-03T18:35:13.838Z] Found /home/<yourName>/.../todo-app/api/api.csproj. Using for user secrets file configuration.

Functions:

        SampleFunction: [GET,POST] http://localhost:7071/api/SampleFunction

For detailed output, run func with --verbose flag.

```

ここで，`http://localhost:7071/api/SampleFunction`にブラウザでアクセスすると，下のように表示されます．

![default-api](/assets/default-api.png)

これでバックエンド単体での実行は完了です．バックエンドが想定通りのデータを返しているかチェックするだけであればこれで十分です．

#### Static Web Apps CLI を起動

**フロントエンドとバックエンドを起動した状態で**別のターミナルを開き，コマンドを実行します．

実行コマンド
```bash
make swa
```

**出力**
```bash
Welcome to Azure Static Web Apps CLI (1.1.6)

***********************************************************************
* WARNING: This emulator may not match the cloud environment exactly. *
* Always deploy and test your app in Azure.                           *
***********************************************************************

[swa] 
[swa] Using dev server for static content:
[swa]   http://localhost:5173
[swa] 
[swa] Using dev server for API:
[swa]   http://localhost:7071
[swa] 
[swa] Azure Static Web Apps emulator started at http://localhost:4280. Press CTRL+C to exit.
[swa] 
[swa] 

```

これで，`http://localhost:4280`をブラウザで開きます．すると，下のように，作成中のフロントエンドアプリが表示されるはずです．

![default-client](/assets/default-client.png)

また，`http://localhost:4280/api/SampleFunction`に飛ぶと，バックエンドのレスポンスが帰ってきます．

![default-api](/assets/default-api.png)

フロントエンドとバックエンドが統合された状態での機能を追加する場合は，`Static Web Apps CLI`を使いましょう．