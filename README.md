# Static Web Appsによる最小Webアプリを作る

## はじめに
この記事は「C3 Advent Calendar 2023」21日目の記事です。

どうもMizuhaです．C3では主にHackで活動し，たびたびゲーム制作やイラスト描いています．

この記事は，実際にWebアプリを作ってみるハンズオン記事となっています．スクロールバーのサイズを見てお察しかと思いますが，とんでもねぇ文章量になってます．ただ，フロントエンドとバックエンドを1つの記事で両方面倒を見ている記事はあんまり無いと思うので，役に立てばうれしいです．

## 今回やること

今回はTodoアプリを作成し，AzureのStatic Web Appsにデプロイ(公開)するまでをやっていきます．Static Web AppsはWebフロントをデプロイするのに使われるサービスですが，Azure Functionsというバックエンドサーバーをくっつけてデプロイすることができたり，認証機能が簡単に付けれたりします．そんな機能をフル活用して，認証機能付きのTodoアプリを作成していきます．また，データベースとして，Azure Storage Accountを使用します．Storage Accountは，データベースとしてはかなり安く，今回作成するプランでは0.02$/GBで運用できるのでおすすめです．

### 使用技術

#### フロントエンド

React.js + Viteのフレームワークを使用し，言語はTypeScriptを使用します．

#### バックエンド

Azure Functionsを使用し，言語はC#を使用します．

また，データ保存のためのデータベースとして，Azure Storage AccountのTable Storageを使用します．

### 技術構成図

![tech-structure](/assets/todo-app-tech.png)

## Static Web Appのメリット / デメリット

### メリット

#### フロントエンドとバックエンドの繋ぎが楽

Static Web Appsにフロントエンドとバックエンドがくっついた状態でデプロイされるので，両者でドメインが分かれません．なので，フロントエンドがバックエンドに問い合わせたい時は，`/api/*`にアクセスするだけで可能になります．

#### GitHub認証とAAD(Microsoftアカウント)認証が付いている

作成したWebアプリの．`/.auth/login/github`にアクセスするとGitHubアカウントでログイン，`/.auth/login/aad`にアクセスするとMicrosoftアカウントでログインする機能が初めから搭載されています．

### デメリット

#### ローカルデバッグが少し面倒

Static Web Apps の機能を使うため，ローカル環境でのデバッグが少し面倒です．ローカル環境でもデバッグができるように，Static Web Apps CLIといういツールがあるので，このツールの使い方に慣れる必要があります．

ただし，デプロイを済ませずとも，フロントエンドとバックエンドを繋ぎこんだ状態でのデバッグができるという利点はあります．

## 環境構築

この記事は，WSLに環境構築を行っています．

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

### Azurite

`Azure Storage Account`をローカル環境でデバッグする際に，`Azurite`を使用します．インストールするには以下のコマンドを実行します．

```bash
npm install -g azurite
```

**インストールの確認**
インストールの確認には，以下のコマンドを実行して，バージョンを確認します．
```bash
azurite -v
```

**出力**
```bash
3.28.0
```
このようにバージョンが表示された場合はインストール完了です．

### Microsoft Azure Storage Explorer
`Microsoft Azure Storage Explorer`は，`Azure Storage Account`に保存されているデータをGUIで見ることができる便利ツールです．

[ここ](https://azure.microsoft.com/ja-jp/products/storage/storage-explorer/)からダウンロードページに飛び，「今すぐダウンロード」から「Windows」を選択します．

![download-azurite](/assets/download-azurite.png)

ダウンロードしたファイルを実行し，利用規約に同意してインストールをしたら，完了です．

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

`Azurite`の起動は`/todo-app`ディレクトリ下で次のコマンドで実行できます．
```bash
azurite --silent --location c:\azurite --debug c:\azurite\debug.log
```

`Static Web Apps CLI`の実行は`/todo-app`ディレクトリ下で次のコマンドで実行できます．

```bash
swa start http://localhost:5173 --api-devserver-url http://localhost:7071
```

この4つのコマンドを実行することになります．いちいち打つのはまぁ超面倒ですよね...

そこで，これらのコマンド`Makefile`に定義していきます．`/todo-app`ディレクトリ下で，`Makefile`という名前のファイルを作り，以下の内容を入力して保存します．

```Makefile
.PHONY: swa client api azurite

swa:
	swa start http://localhost:5173 --api-devserver-url http://localhost:7071

client:
	cd client && pnpm run dev

api:
	cd api && func start 

azurite:
	azurite --silent --location c:\azurite --debug c:\azurite\debug.log
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
`Azurite`起動コマンド
```bash
make azurite
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

また，`Azure Storage Account`の操作はバックエンドの仕事なので，操作のテストを行いたい場合は`Azurite`も起動しましょう．

```bash
make azurite
```

**出力**

```bash
Azurite Blob service is starting at http://127.0.0.1:10000
Azurite Blob service is successfully listening at http://127.0.0.1:10000
Azurite Queue service is starting at http://127.0.0.1:10001
Azurite Queue service is successfully listening at http://127.0.0.1:10001
Azurite Table service is starting at http://127.0.0.1:10002
Azurite Table service is successfully listening at http://127.0.0.1:10002
```

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

## 開発開始

以下提示するコードは，ファイルの一部を抜粋したもので完全なコードではないものもあります．また，cssファイルなど，コードを提示していないファイルも存在します．なので[こちら](https://github.com/Mizuha-hk/todo-app)のGitHubのリポジトリからコードを参照しながら，この記事を読むことをおすすめします．

### フロントエンド

#### 概要

今回作成するTodoアプリに必要なものをリストアップしてみます．

**UIの部品**
|コンポーネント名|説明|
|:--|:--|
|`Header`|ヘッダー．ログイン/ログアウト ボタンを配置する．|
|`TodoList`|現在のTodoリストを表示する．|
|`Form`|Todoを追加するためのフォーム．|

**機能**
|機能名|説明|
|:--|:--|
|`get-profile`|ユーザー情報を取得する．|
|`todos`|Todoの取得，追加，削除する．|

**プロバイダー**
|プロバイダー名|説明|
|:--|:--|
|`AppProvider`|アプリ全体で共有する状態を管理するProvider．ログインの状態管理に使用します．|
|`TodoItemProvider`|Todoの状態を管理するProvider．|

ディレクトリ構造は下のようになりました．`react.js`は基本的に`/src`以下にファイルを配置していきます．UIの部品は`/src/components`以下，機能は`/src/features`以下に，プロバイダーは`/src/providers`以下に配置します．

**ディレクトリ構成**
```
client
├── README.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   └── vite.svg
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── Form
│   │   │   ├── Form.css
│   │   │   └── Form.tsx
│   │   ├── Header
│   │   │   ├── Header.css
│   │   │   └── Header.tsx
│   │   └── TodoList
│   │       ├── TodoList.css
│   │       └── TodoList.tsx
│   ├── features
│   │   ├── get-profile
│   │   │   ├── api
│   │   │   │   └── ClientPrincipal.ts
│   │   │   └── index.ts
│   │   └── todos
│   │       ├── api
│   │       │   ├── TodoAction.ts
│   │       │   ├── TodoItem.ts
│   │       │   └── TodoItemRequest.ts
│   │       └── index.ts
│   ├── index.css
│   ├── main.tsx
│   ├── providers
│   │   ├── AppProvider.tsx
│   │   └── TodoItemProvider.tsx
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

#### 機能を実装する

`/src/features`にアプリの機能部分を実装していきます．基本的にここには，バックエンドとの繋ぎこみの処理を書いていきます．

##### todos

まず，Todoのデータを格納する型を作っていきます．`features/todos/api`以下に作成します．

**TodoItem.ts**
```ts
type TodoItem = {
    id: string;
    userId: string;
    title: string;
    description: string;
}

export type { TodoItem };
```

また，Todoを追加する際に，バックエンドに問い合わせる情報の型を作っていきます．

**TodoItemRequest.ts**
```ts
type TodoItemRequest = {
    userId: string;
    title: string;
    description: string;
}

export type { TodoItemRequest }
```

そして，Todoの取得，追加，削除の処理を追加していきます．ただし，バックエンドはまだ作っていないので，適当なデータを返すように書いていきます．`/features/todos`以下に次のファイルを追加します．

**index.ts**
```ts
import { TodoItem } from "./api/TodoItem";
import { TodoItemRequest } from "./api/TodoItemRequest";

async function GetTodos(userId: string) {

  //適当なデータ
    const body = [
        {
            id: "7ff198b0-8bbe-4d6c-a7b0-ab4a527d5389",
            userId: userId,
            title: "Test1",
            description: "Test1"
        },
        {
            id: "1ad0f127-4f79-46e2-9e16-1eb707a371fb",
            userId: userId,
            title: "Test2",
            description: "Test2",
        },
        {
            id: "586ce27f-bd18-4cf6-b7ff-3c3f410748c2",
            userId: userId,
            title: "Test3",
            description: "Test3",
        }
    ] as TodoItem[];
    return body;
}

async function PostTodos(todo: TodoItemRequest) {

    //適当なデータ
    const body = {
        id: "f3b892e3-9ccd-408a-99a4-cc86dea37463",
        userId: todo.userId,
        title: todo.title,
        description: todo.description
    } as TodoItem;

    return body;
}

async function DeleteTodos(todo: TodoItem) {
    
}

export { GetTodos };
export { PostTodos };
export { DeleteTodos };
```

##### get-profile

認証情報を取得する機能を追加していきます．ログイン済みの状態で，`/.auth/me`にアクセスすると，ユーザー情報を取得することができます．ただし，この機能のデバッグには`Static Web Apps CLI`の起動が必須になります．ユーザー情報は以下のような形式で取得できます．

```json
{
    "clientPrincipal": {
        "identityProvider": "github",
        "userId": "je89c8db0-3f6c-4f73-a802-20bfe0134f4c",
        "userDetails": "UserName",
        "userRoles": [
            "anonymous",
            "authenticated"
        ]
    }
}
```
このデータ形式に合わせて，データを受け取るための型を作成していきます．

`/get-profile/api`に次のファイルを作成していきます．

**ClientPrincipal.ts**
```ts
type ClientPrincipal = {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
}

type AuthResponse = {
    clientPrincipal: ClientPrincipal;
}

export type { ClientPrincipal };

export type { AuthResponse };
```

`AuthResponse`型でデータを受け取っていきます．`/features/get-profile`いかに次のファイルを作成します．

**index.ts**
```ts
import { AuthResponse } from "./api/ClientPrincipal";

async function GetProfile() {
    const result = await fetch('/.auth/me');
    const body = await result.json() as AuthResponse;
    return body;
}

export { GetProfile };
```

ログインしていない場合は，`AuthResponse`内の`clientPrincipal`に`null`が入っているので，これでログインしているか，していないかを判定します．

#### プロバイダーを実装する

##### AppProvider

`useState`でユーザー情報を状態として持ち，その情報をProviderとして子コンポーネントに提供します．`useEffect`で読み込み時に`GetProfile`を呼び出し，ユーザー情報を取得して`setUser`で反映させています．

**AppProvider.tsx**
```ts
import React, { createContext, useEffect, useState } from "react"
import { GetProfile } from "../features/get-profile";
import { AuthResponse } from "../features/get-profile/api/ClientPrincipal";

type AppProviderProps = {
    children: React.ReactNode;
};

const AppContext = createContext<AuthResponse | null>(null);

const AppProvider : React.FC<AppProviderProps> = ({children}) => {
    const [user, setUser] = useState<AuthResponse | null>(null);

    useEffect(() =>
    {
        GetProfile().then((response) => setUser(response));
    }, []);

    if(user === null){
        return <div>Loading...</div>
    }

    return(
        <AppContext.Provider value={user}>
            {children}
        </AppContext.Provider>
    )
};

export function useAppContext(){
    const context = React.useContext(AppContext);
    if(context === undefined){
        throw new Error("useAppContext must be used within a AppProvider");
    }
    return context;
}

export default AppProvider;
```

##### TodoItemProvider

**TodoAction.ts**

各アクション(Todoを追加する，削除する等)ごとに必要なパラメーター
```ts
import { TodoItem } from "./TodoItem";

type TodoAction =
    { type: 'ADD_TODO', todo: TodoItem } |
    { type: 'REMOVE_TODO', id: string } |
    { type: 'GET_TODOS', todos: TodoItem[]};

export type { TodoAction };
```

**TodoItemProvider.tsx**
```ts
import React, { Dispatch, createContext, useEffect, useReducer } from "react";
import { TodoItem } from "../features/todos/api/TodoItem";
import { GetTodos } from "../features/todos";
import { TodoAction } from "../features/todos/api/TodoAction";
import { useAppContext } from "./AppProvider";

type TodoItemProviderProps = {
    children: React.ReactNode;
};

const TodoItemContext = createContext<{
    todos: TodoItem[];
    dispatch: Dispatch<TodoAction>;
} | undefined>(undefined);


const initialtodos: TodoItem[] = [];

const reducer = (todos: TodoItem[], action: TodoAction) => {
    switch (action.type) {
        case "ADD_TODO":{
            if(action.todo.title === ""){
                return todos;
            }      
            //元のtodosと追加したtodoを連結して返す
            return [...todos, action.todo]
        }
        case "REMOVE_TODO":{
            //todosの中で，削除するidのアイテム以外を返す
            return todos.filter(todo => todo.id !== action.id);
        }
        case "GET_TODOS":
            //渡したtodosをそのまま返す
            return action.todos;
        default:
            return todos;
        }
    }
           
const TodoItemProvider : React.FC<TodoItemProviderProps> = ({children}) =>{
    const resource = useAppContext();
    const [todos, dispatch] = useReducer(reducer, initialtodos);
    const isLoggedIn = resource?.clientPrincipal !== null;

    useEffect(() =>
    {
        //ログインしていないときは何もしない
        if(!isLoggedIn){
            return;
        }
        //GetTodosでTodoを取得し，dispatchでtodosにセットする
        GetTodos(resource?.clientPrincipal.userId ?? "").then((response) => {
            dispatch({type: "GET_TODOS", todos: response})
        });
    }, []);

    if(todos === null){
        return <div>Loading...</div>
    }

    return(
        <TodoItemContext.Provider value={{todos, dispatch}}>
            {children}
        </TodoItemContext.Provider>
    )
};

export function useTodoItemContext(){
    const context = React.useContext(TodoItemContext);
    if(context === undefined){
        throw new Error("useTodoItemContext must be used within a TodoItemProvider");
    }
    return context;
}

export default TodoItemProvider;
```

#### UIを実装する

##### Header

**Header.tsx**
```ts
import './Header.css'
import { useAppContext } from "../../providers/AppProvider"

function Header(){
    //AppProviderのAppContextからユーザー情報を取得する
    const resource = useAppContext();
    //clientPrincipalがnullかどうかでログインしているか判定する
    const isLoggedIn = resource?.clientPrincipal !== null;

    return(
        <header>
        <h2>Todo-App</h2>
        <div>
            <!--ログイン状態の時-->
            {isLoggedIn ? (
                <a href="/.auth/logout">ログアウト</a>
            ) : (
            <!--ログインしていないとき-->
                <a href="/.auth/login/github">ログイン</a>
            )}
        </div>
        </header>
    )
}

export default Header
```

`Header.css`でお好みの見た目にしてみてください．

##### TodoList

**TodoList.tsx**
```ts
import { DeleteTodos } from '../../features/todos';
import { useAppContext } from '../../providers/AppProvider';
import { useTodoItemContext } from '../../providers/TodoItemProvider';
import './TodoList.css';

function TodoList(){
    //AppProviderのAppContextからユーザー情報の取得
    const resource = useAppContext();
    //TodoItemProviderのTodoItemContextから，todosとdispatchメソッドの取得
    const {todos, dispatch} = useTodoItemContext();
    const isLoggedIn = resource?.clientPrincipal !== null;

    return (
        <div className='root'>
            {
                isLoggedIn ? (
                    <div>
                        <h1>あなたのタスク</h1>
                        <ul className='todo-list'>
                            <!--todosのすべての要素に対して以下のようなUIを実装-->
                            {todos.map((todo, i) => (
                                <li key={i}>
                                <div className='over-view'>
                                    <div className='title item-border'>
                                        {todo.title}
                                    </div>
                                    <div className='description'>
                                        {todo.description}
                                    </div>
                                </div>
                                <button onClick={async () => {
                                    await DeleteTodos(todo);
                                    dispatch({type:'REMOVE_TODO',id:todo.id})   
                                    }} 
                                    className='button'>完了</button>
                            </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>
                        <p>ログインしてください</p>
                    </div>
                )
            }
        </div>
    )
}

export default TodoList
```

`TodoList.css`でお好みの見た目にしてください．

##### Form

**Form.tsx**
```ts
import React from "react";
import { useAppContext } from "../../providers/AppProvider";
import { useTodoItemContext } from "../../providers/TodoItemProvider";
import { PostTodos } from "../../features/todos";
import './Form.css';


function Form() {
    const resource = useAppContext();
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const {dispatch} = useTodoItemContext();

    //追加ボタンを押したときの処理
    async function onSubmited(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        var response = await PostTodos({title, description, userId: resource?.clientPrincipal.userId ?? ""});
        dispatch({type: "ADD_TODO", todo: response});
    }

    const isLoggedIn = resource?.clientPrincipal !== null;
    return(
        <div className="form">
        {
            isLoggedIn ? (
            <div>
                <h1>タスクを追加</h1>
                <form onSubmit={onSubmited}>
                    <h2>タイトル</h2>
                    <input
                        className="title"
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        type="text" />
                    <h2>説明</h2>
                    <input
                        className="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        type="text" />
                    <button className="submit" type="submit">追加</button>
                </form>
            </div>
            ) : (
                <div>
                </div>
            )
        }
        </div>
    )
}

export default Form
```

`Form.css`でお好みの見た目にしてください．

#### App.tsxを編集

最後に，`App.tsx`を編集して，これまで作成した部品を組み立てます．
```ts
//import './App.css'
import AppProvider from './providers/AppProvider'
import Header from './components/Header/Header'
import TodoList from './components/TodoList/TodoList'
import Form from './components/Form/Form'
import TodoItemProvider from './providers/TodoItemProvider'

function App() {

  return (
    <>
      <AppProvider>
        <Header/>
        <TodoItemProvider>
          <TodoList/>
          <Form/>
        </TodoItemProvider>
      </AppProvider>
    </>
  )
}

export default App

```

#### staticwebapp.config.json

`staticwebapp.config.json`はその名の通り，`Static Web Apps`の設定を書くファイルです．このファイルを編集すると，ユーザーが特定のページへのアクセスを制限したり，別のページにリダイレクトさせたりするような，ルールを書くことができます．

例えば，`/admin`というページにサイト管理するようなページを作成したとすると，ただページを作成しただけでは，URLに`/admin`と打ち込むだけで誰でも簡単にアクセスできてしまいます．ここで，`staticwebapp.config.json`に以下のような記述をします．

**staticwebapp.config.json**
```json
{
  "routes":[
    {
      "route":"/admin",
      "allowedRoles":["admin"]
    }
  ]
}
```
こうすることによって，`/admin`にアクセスするユーザーが，`"admin"`というロールが無いとこのページにアクセスできないようになります．

**ユーザー情報**
```json
{
    "clientPrincipal": {
        "identityProvider": "github",
        "userId": "je89c8db0-3f6c-4f73-a802-20bfe0134f4c",
        "userDetails": "UserName",
        "userRoles": [
            "anonymous",
            "authenticated"
            //ここに"admin"という項目が無いとアクセスできない
        ]
    }
}
```

今回のTodoアプリには，以下のようなルールを設けようと思います．
- `/api/*`(バックエンドへの問い合わせ)は認証したユーザー(`"authenticated"`ロールを持つユーザー)しかできないようにする．
- `/.auth/login/github`を`/login`で簡略化する
- `/.auth/logout`を`/logout`で簡略化する
- AAD認証は出来ないようにする

この構成を行う`staticwebapp.config.json`は以下のようになります．

**staticwebapp.config.json**
```json
{
    "trailingSlash": "auto",
    "routes":[
        {
            "route":"/",
            "allowedRoles":["anonymous","authenticated"]
        },
        {
            "route":"/api/*",
            "allowedRoles":["authenticated"]
        },
        {
            "route": "/login",
            "rewrite": "/.auth/login/github"
        },
        {
            "route":"/logout",
            "redirect":"/.auth/logout"
        },
        {
            "route":"/.auth/login/aad",
            "statusCode":404
        }
    ]
}
```
では，ログイン，ログアウトのルートが変わったので，`Header.tsx`も書き換えましょう．

```ts
import './Header.css'
import { useAppContext } from "../../providers/AppProvider"

function Header(){
    const resource = useAppContext();

    const isLoggedIn = resource?.clientPrincipal !== null;

    return(
        <header>
        <h2>Todo-App</h2>
        <div>
            {isLoggedIn ? (
                <a href="/logout">ログアウト</a>
            ) : (
                <a href="/login">ログイン</a>
            )}
        </div>
        </header>
    )
}

export default Header
```

`staticwebapp.config.json`のもっと細かい設定が気になる人は[こちら](https://learn.microsoft.com/ja-jp/azure/static-web-apps/configuration)の公式ドキュメントを読んでみてください．

これで，フロントエンドの大部分が完成です．

#### 実行してみる

`Static Web Apps CLI`を起動して，http://localhost:4280 にアクセスしてみましょう．

![mainpage](/assets/mainpage.png)

ログインしていない状態だと，このように表示されるはずです．では，ログインボタンを押して，ログインしてみましょう．

![locallogin](/assets/locallogin.png)
すると，このようなページが表示されるはずです．デプロイ先の環境では，実際のGitHubアカウントと連携しますが，`Static Web Apps CLI`を使用したデバッグだと，このようにユーザー情報を好きにいじってテストができるようになっています．今回は適当なUsernameを入力してLoginボタンを押しましょう．

![loggedinpage](/assets/logedinpage.png)

このように表示され，完了を押すとリストから削除され，フォームからタイトルと説明を入力して追加ボタンを押すと，リストに追加されます．

では，一度ログアウトして，URLに`/.auth/login/aad`を追加して，無理やりAAD認証しようとします．

![notfound](/assets/notfound.png)

`staticwebapp.config.json`でAAD認証使用しようとすると，404を返すように設定しているので，`404: Not Found`のページが表示されます．

また，このログアウトした状態で，`/api/SampleFunction`にアクセスしてみます．

![unauthorized](/assets/unauthorized.png)
`staticwebapp.config.json`で認証済みユーザーにしか`/api/*`にアクセスできないようにしたので，このように`401: Unauthorized`のページが表示されます．

### バックエンド

#### 概要

バックエンド側で実装する機能は，Table Storageに保存されているTodoに対して，Todoの取得，保存，削除の3つです．また，今回はフロントエンドの実装が重くなるため使いませんが，保存されているTodoに対して更新する機能も作ります．余力があれば，フロントエンドからこのAPIにリクエストを送って，Todoの内容を編集する機能をつけてみてください．

**ディレクトリ構造**
```
api
├── Entity
│   └── TodoEntity.cs
├── Models
│   ├── TodoModel.cs
│   └── TodoRequestModel.cs
├── Properties
│   └── launchSettings.json
├── SampleFunction.cs
├── TodoFunction.cs
├── api.csproj
├── host.json
└── local.settings.json
```

#### 必要なパッケージのインストール
今回はAzure Storage AccountのTable Storageにデータを保存していきます．そのために必要なパッケージをインストールしていきます．`/api`ディレクトリで以下の3つのコマンドを実行してください．

```bash
dotnet add package Azure.Data.Tables --version 12.8.2
dotnet add package Microsoft.Azure.WebJobs.Tables --version 1.2.1
dotnet add package Microsoft.Azure.WebJobs.OpenApi --version 1.5.1
```
#### Entityの追加

Table Storageに保存されるデータには，`PartitionKey`と`RowKey`という要素が必須です．今回は`userId`を`PartitionKey`として使用し，Todoを一意に識別する`id`を`RowKey`として使用します．

また，`Timestamp`と`ETag`も必須なので，追加しています．`Timestamp`はデータを保存した段階の時間を表す項目です．

`ETag`はおまじないです．(~~説明するためにちゃんと調べたけど記事なさ過ぎてキレそう~~)

`api/Entity`ディレクトリ下に，`TodoEntity.cs`というファイルを追加して，`TodoEntity`というクラスを定義していきます．この時，`ITableEntity`を継承します．そして，上記の4つの必須メンバに加えて，Todoのタイトルとして保存する`Title`と説明として保存する`Description`を追加しています．

```cs
using System;
using Azure;
using Azure.Data.Tables;

namespace api.Entity
{
    public class TodoEntity: ITableEntity //ITableEntityを継承
    {
        //id
        public string RowKey { get; set; }
        //userId
        public string PartitionKey { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }

        public DateTimeOffset? Timestamp { get; set; }   
        public ETag ETag { get; set; }
    }
}
```
この形式のデータがTable Storageに保存されることになります．

#### Modelの追加

Table Storageに保存するためのEntityを定義しましたが，フロントエンドとのデータのやり取りで`TodoEntity`クラスの形式でやり取りするわけではありません．そこで，フロントエンドとやり取りするためのクラスを定義していきます．

**TodoModel.cs**

Todoの取得や追加処理の時にフロントエンドに返す型
```cs
namespace api.Models
{
    public class TodoModel
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
```

**TodoRequestModel**

Todoの追加処理の時，フロントエンドからのリクエストを受け取るための型
```cs
namespace api.Models
{
    public class TodoRequestModel
    {
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
```

このように定義してもいいですが，`TodoModel`と`TodoRequestModel`ではメンバに`Id`の項目が増えただけなので，`TodoModel`は継承を使うとすっきり書けます．

**TodoModel.cs**
```cs
namespace api.Models
{
    public class TodoModel : TodoRequestModel
    {
        public string Id { get; set; }
    }
}
```

これでフロントエンドとやり取りするModelの追加は完了です．

#### Functionの追加

`/todo-app/api`ディレクトリ下で以下のコマンドを実行し，`HttpTrigger`で，名前が`TodoFunction`で関数の追加をしていきます．

```bash
func new
```

すると，プロジェクト作成時に作成した`SampleFunction`と同じコードが生成されます．この`TodoFunction.cs`を編集していきます．

#### Functionの編集

では，`TodoFunction.cs`を編集して，各機能を実装していきます．以下，紹介するコードは`public static class TodoFunction { }`の中に書いていきます．

##### Todoの取得

Todoの取得のエンドポイントは，クエリパラメータとして`userId`をもらうと，そのユーザーが持つTodoをリストで返すようになっています．また，`userId`に加えて`todoId`というパラメータをもらうと，該当するTodoが1件返すようになっています．

```cs
[FunctionName("GetTodos")]
[OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
[OpenApiParameter(name: "userId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
[OpenApiParameter(name: "todoId", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
[OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<TodoModel>))]
public static async Task<IActionResult> GetTodos(
    [HttpTrigger(AuthorizationLevel.Function, "get", Route = "todo")] HttpRequest req,
    [Table("Todo", Connection = "TodoStorageConnection")] TableClient tableClient,
    ILogger log)
{
    log.LogInformation($"GET /todo executed with userId: {req.Query["userId"]} and todoId: {req.Query["todoId"]}");
    //リクエストからクエリパラメータを取得
    string userId = req.Query["userId"];
    string todoId = req.Query["todoId"];
    //userIdが指定されていないと，400:BadRequestを返す
    if(string.IsNullOrEmpty(userId))
    {
        return new BadRequestObjectResult("UserId is required");
    }

    if(string.IsNullOrEmpty(todoId))
    {
        //todoIdが指定されていないときの処理
        var todos = tableClient.Query<TodoEntity>().Where(t => t.PartitionKey == userId).ToList();
        var todoModels = new List<TodoModel>();
        foreach(var todo in todos)
        {
            todoModels.Add(new TodoModel
            {
                Id = todo.RowKey,
                UserId = todo.PartitionKey,
                Title = todo.Title,
                Description = todo.Description
            });
        }
        return new OkObjectResult(todoModels);               
    }
    else
    {
        //todoIdが指定されたときの処理
        var todo = await tableClient.GetEntityAsync<TodoEntity>(userId, todoId);
        var todoModel = new TodoModel
        {
            Id = todo.Value.RowKey,
            UserId = todo.Value.PartitionKey,
            Title = todo.Value.Title,
            Description = todo.Value.Description
        };

        return new OkObjectResult(todoModel);
    }
}
```

まぁAzure Functionsはかなり癖の強いコードなので，説明していきます．(~~実際私はこの書き方はあまり好きじゃない~~)

このコードは[]でメソッドそのものや引数に属性というものを付与しているので，慣れないとかなり見にくいです．なので，いったん属性を取り除いてみます．

```cs
public static async Task<IActionResult> GetTodos(
    HttpRequest req,
    TableClient tableClient,
    ILogger log)
{
    //省略    
    return new OkObjectResult(...);
}
```
こうしてみると，引数は`HttpRequest`型の`req`，`TableClient`型の`tableClient`，`ILogger`型の`log`の3つをもらい，`OkObjectResult`等のレスポンスを返すメソッドになっています．

このメソッド自体に5つの属性が付与されています．
```cs
[FunctionName("GetTodos")]
[OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
[OpenApiParameter(name: "userId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
[OpenApiParameter(name: "todoId", In = ParameterLocation.Query, Required = false, Type = typeof(string))]
[OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(List<TodoModel>))]
```

`FunctionName`属性で，この関数の名前が付加されています．その他の`OpenApiOperation`等は，後に紹介するSwaggerというAPIのテストをしやすくするツールに対して，「このAPIはこういうリクエストをもらって，こういうレスポンスを返すよ」と指定してあげる属性なので，実装そのものに直接影響するものではありません．

第一引数の`req`には以下のような属性が付与されています．
```cs
[HttpTrigger(AuthorizationLevel.Function, "get", Route = "todo")]
```
これは`req`に対して`api/todo`にGETメソッドのリクエストだということを指定しています．`AuthorizationLevel.Function`というのは，このAPIにアクセスできる認証レベルを指定しています．ただし，今回はStatic Web Appsに内包されたAzure Functionsであり，アクセスのレベルは`staticwebapp.config.json`で記述されているので，特に変更は必要ないです．

第二引数の`tableClient`には以下のような属性が付与されています．
```cs
[Table("Todo", Connection = "TodoStorageConnection")]
```

これは，Storage AccountのTable Storageを操作する`tableClient`に対して，Table Storageへ`"TodoStorageConnection"`という環境変数に保存されている文字列を使って接続し，そのTable Storageの`Todo`という名前のテーブルを操作するという性質を付与しています．

**環境変数について**

Storage Accountは外部のサービスなので，そのサービスに接続するための**秘密の文字列**を使って接続をします．それが**接続文字列**です．接続文字列は流出すると悪用されるので，**コードに直接書いた状態でGitHub等に絶対にアップロードしてはいけません**．そこで，環境変数というものを使います．ローカル環境では，環境変数は`local.settings.json`に格納します．このファイルは`.gitignore`に含まれるため，`.gitignore`をいじらない限りGitHubにアップロードされることはありません．

以下のファイルはプロジェクト作成時に生成される`local.settings.json`です．

**local.settings.json**
```json
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "FUNCTIONS_WORKER_RUNTIME": "dotnet"
    }
}
```
この`Values`の中に，文字列名と文字列をセットで格納します．この中にすでに，`"AzureWebJobsStorage"`という名前で`"UseDevelopmentStorage=true"`という文字列，`"FUNCTIONS_WORKER_RUNTIME"`という名前で`"dotnet"`という文字列が入っています．

例えば，`"UseDevelopmentStorage=true"`という文字列を使うとき，コード上では`"AzureWebJobsStorage"`という名前でしか見えないので，中の文字列が見えないようになっているというわけです．

第三引数の`log`には何も属性が付与されていません．`log`について細かく説明しようとすると泥沼にはまってしまうので，とりあえず，Azure Functionsを実行中，ターミナルにログを出力したいときに，`log.LogInformation("...");`のように使うと，ログが出力できるオブジェクトであるとだけ言っておきます．

---

今回は，ローカルのデバッグでAzuriteを使用しますが，そのAzuriteに接続するための`"TodoStorageConnection"`が環境変数に設定されていないので設定していきます．

この`"AzureWebJobsStorage"`を`"TodoStorageConnection"`に変更してください．

```json
{
    "IsEncrypted": false,
    "Values": {
        "TodoStorageConnection": "UseDevelopmentStorage=true",
        "FUNCTIONS_WORKER_RUNTIME": "dotnet"
        
    }
}
```

実は`"UseDevelopmentStorage=true"`という文字列が，Azuriteに接続するための接続文字列でした．`"AzureWebJobsStorage"`をそのまま使ってもよかったのですが，デプロイ時に少し支障があるので，名前を変更しました．

##### Todoの追加

Todoの追加のエンドポイントは，`userId`，`Title`，`Description`の項目を持つオブジェクトを受け取り，このTodoに一意に定まる`id`を付加してTable Storageに保存して，そのデータをフロントエンドに返します．

```cs
[FunctionName("AddTodo")]
[OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
[OpenApiRequestBody(contentType: "application/json", bodyType: typeof(TodoRequestModel), Required = true, Description = "Todo object that needs to be added")]
[OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(TodoModel))]
public static async Task<IActionResult> AddTodo(
    [HttpTrigger(AuthorizationLevel.Function, "post", Route = "todo")] HttpRequest req,
    [Table("Todo", Connection = "TodoStorageConnection")] TableClient tableClient,
    ILogger log)
{
    log.LogInformation($"POST /todo executed with body: {await req.ReadAsStringAsync()}");

    //リクエストのbodyをJSON形式の文字列として読み取り，TodoRequestModeとして解釈する
    var requestBody = await req.ReadAsStringAsync();
    var todoRequestModel = JsonConvert.DeserializeObject<TodoRequestModel>(requestBody);
    
    //userIdとタイトルは空にできないようにする
    if(string.IsNullOrEmpty(todoRequestModel.UserId) || string.IsNullOrEmpty(todoRequestModel.Title))
    {
        return new BadRequestObjectResult("UserId and Title are required");
    }

    //レスポンスとして返すオブジェクト
    var todoModel = new TodoModel
    {
        /*一意に定まるidを生成して付加*/
        Id = System.Guid.NewGuid().ToString(),
        UserId = todoRequestModel.UserId,
        Title = todoRequestModel.Title,
        Description = todoRequestModel.Description
    };

    //Table Storageに保存するオブジェクト
    var todoEntity = new TodoEntity
    {
        RowKey = todoModel.Id,
        PartitionKey = todoModel.UserId,
        Title = todoModel.Title,
        Description = todoModel.Description,
        Timestamp = System.DateTimeOffset.UtcNow,
        ETag = ETag.All
    };
    //Table Storageに保存
    await tableClient.AddEntityAsync(todoEntity);

    return new OkObjectResult(todoModel);
}
```

##### Todoの更新

Todoの更新のエンドポイントは，更新後のTodoのオブジェクトを受け取り，Table Storage側を更新して，そのデータをそのまま返します．

(追記: わざわざデータを返さずに`return new NoContentResult()`でいいかも)

```cs
[FunctionName("UpdateTodo")]
[OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
[OpenApiRequestBody(contentType: "application/json", bodyType: typeof(TodoModel), Required = true, Description = "Todo object that needs to be updated")]
[OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(TodoModel))]
public static async Task<IActionResult> UpdateTodo(
    [HttpTrigger(AuthorizationLevel.Function, "put", Route = "todo")] HttpRequest req,
    [Table("Todo", Connection = "TodoStorageConnection")] TableClient tableClient,
    ILogger log)
{
    log.LogInformation($"PUT /todo executed with body: {await req.ReadAsStringAsync()}");

    var requestBody = await req.ReadAsStringAsync();
    var todoModel = JsonConvert.DeserializeObject<TodoModel>(requestBody);

    //userIdとタイトルは空にできないようにする
    if(string.IsNullOrEmpty(todoModel.UserId) || string.IsNullOrEmpty(todoModel.Title))
    {
        return new BadRequestObjectResult("UserId and Title are required");
    }

    //更新先のデータオブジェクト
    var todoEntity = new TodoEntity
    {
        RowKey = todoModel.Id,
        PartitionKey = todoModel.UserId,
        Title = todoModel.Title,
        Description = todoModel.Description,
        Timestamp = System.DateTimeOffset.UtcNow,
        ETag = ETag.All
    };

    //対象のデータを更新する
    await tableClient.UpdateEntityAsync(todoEntity, ETag.All);

    return new OkObjectResult(todoModel);
}
```

##### Todoの削除

Todo削除のエンドポイントは，クエリパラメータとして`userId`と`todoId`を受け取り，対象のデータをTableStorageから削除して，NoContentを返す．

```cs
[FunctionName("DeleteTodo")]
[OpenApiOperation(operationId: "Run", tags: new[] { "Todo" })]
[OpenApiParameter(name: "userId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
[OpenApiParameter(name: "todoId", In = ParameterLocation.Query, Required = true, Type = typeof(string))]
[OpenApiResponseWithBody(statusCode: System.Net.HttpStatusCode.NoContent, contentType: "application/json", bodyType: typeof(string))]
public static async Task<IActionResult> DeleteTodo(
    [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "todo")] HttpRequest req,
    [Table("Todo", Connection = "TodoStorageConnection")] TableClient tableClient,
    ILogger log)
{
    log.LogInformation($"DELETE /todo executed with userId: {req.Query["userId"]} and todoId: {req.Query["todoId"]}");

    string userId = req.Query["userId"];
    string todoId = req.Query["todoId"];

    //userIdとtodoIdは必須
    if(string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(todoId))
    {
        return new BadRequestObjectResult("UserId and TodoId are required");
    }
    //Table Storageの対象データを削除する
    await tableClient.DeleteEntityAsync(userId, todoId);

    return new NoContentResult();
}
```

これでバックエンドの実装は終了です．

#### 実行してみる

バックエンドのテストは，`curl`コマンドや`Postman`といったアプリを使えば可能ですが，今回はSwaggerに対応するように実装したので，Swaggerを使用していきます．

##### azuriteを準備する

新しいターミナルを開いて，azuriteを起動します.
```bash
make azurite
```
Microsoft Azure Storage Explorerを起動します．

![storage-exp-home](/assets/storage-exp-home.png)

「ストレージアカウント」 から 「(エミュレーター 既定のポート) (Key)」を開きます．

そこから「Tables」を右クリックし，「テーブルの作成」から`Todo`という名前を付けてテーブルを作成します．

![make-table](/assets/storage-exp-mk-table.png)

![made-table](/assets/storage-exp-made-table.png)

これでazuriteの準備は完了です．

##### Azure Functionsを起動する

新しいターミナルを開いて，Azure Functionsを起動します．
```bash
make api
```
出力
```bash
cd api && func start 
MSBuild version 17.8.3+195e7f5a3 for .NET
  Determining projects to restore...
  All projects are up-to-date for restore.
  api -> /home/UserName/.../todo-app/api/bin/output/api.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:12.01



Azure Functions Core Tools
Core Tools Version:       4.0.5455 Commit hash: N/A  (64-bit)
Function Runtime Version: 4.27.5.21554

[2023-12-13T06:50:34.628Z] Found /home/miz/source/repos/todo-app/api/api.csproj. Using for user secrets file configuration.

Functions:

        AddTodo: [POST] http://localhost:7071/api/todo

        DeleteTodo: [DELETE] http://localhost:7071/api/todo

        GetTodos: [GET] http://localhost:7071/api/todo

        RenderOAuth2Redirect: [GET] http://localhost:7071/api/oauth2-redirect.html

        RenderOpenApiDocument: [GET] http://localhost:7071/api/openapi/{version}.{extension}

        RenderSwaggerDocument: [GET] http://localhost:7071/api/swagger.{extension}

        RenderSwaggerUI: [GET] http://localhost:7071/api/swagger/ui

        SampleFunction: [GET,POST] http://localhost:7071/api/SampleFunction

        UpdateTodo: [PUT] http://localhost:7071/api/todo

For detailed output, run func with --verbose flag.
[2023-12-13T06:50:42.601Z] Host lock lease acquired by instance ID '00000000000000000000000036942E80'.
```

出力のRenderSwaggerUIにある http://localhost:7071/api/swagger/ui にアクセスします．

![swagger-home](/assets/swagger-home.png)

このページからAPIのテストができます．今はデータが入っていないので，POSTからTodoの追加をしてみます．

POSTの項目の「Try it out」ボタンを押します．すると，バックエンドに送信するデータを編集できます．

![try-it-out](/assets/try-it-out.png)

今はテストなので，適当な`userId`，`title`，`description`を指定して「Execute」を押します．

![execute-post](/assets/execute-post.png)

すると下にスクロールすると以下のようにバックエンドから帰ってきたレスポンスが表示されます．

![post-response](/assets/post-response.png)

あとは同様に，Todoを取得するGET，更新するPUT，削除するDELETEを好きに試してみてください．

### 繋ぎこみ

バックエンドが完成したので，`client/src/features/todos/index.ts`を書き換えて，バックエンドサーバーにアクセスするようにします．

```ts
import { TodoItem } from "./api/TodoItem";
import { TodoItemRequest } from "./api/TodoItemRequest";

async function GetTodos(userId: string) {
    const result = await fetch('/api/todo/?userId=' + userId, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
            }
        });
    const body = await result.json() as TodoItem[];

    return body;
}

async function PostTodos(todo: TodoItemRequest) {
    const result = await fetch('/api/todo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
    });
    const body = await result.json() as TodoItem;
    return body;
}

async function DeleteTodos(todo: TodoItem) {
        await fetch('/api/todo/?userId='+todo.userId+'&todoId='+todo.id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export { GetTodos };
export { PostTodos };
export { DeleteTodos };
```

これでバックエンドとの繋ぎこみは終了です．実際に`azurite`と`Static Web Apps CLI`を起動して，TODOアプリとして使ってみてください．もちろん，ログイン時にuserIdを変えたら，前のuserIdでのTodoは見れなくなります．

## デプロイ

[Azure Portal](https://portal.azure.com/)にログインします．ログインするアカウントは，**学生用アカウント**を使用することをお勧めします．

>学生用アカウントは，100$/年分のリソースを無料で使用することができます．また，登録にクレジットカード等が必要ないので，手軽に使うことができます．

### Static Web Appsの作成
Azure Portalのホーム画面から，リソースの作成をクリックします．

![az-mk-resource](/assets/az-mk-resource.png)

リソースの作成ページの検索ボックスで，`static web app`と検索し，「静的 Web アプリ」の，「作成」> 「静的 Web アプリ」をクリックします．

![az-mk-swa1](/assets/az-mk-swa1.png)

![az-mk-swa2](/assets/az-mk-swa2.png)

クリックすると，Static Web Appの設定を行うページに移ります．まず，「リソース グループ」の項目から，新規作成をクリックし，リソースに適当な名前を付けて「OK」をクリックします．今回は，`todo-app-resource`と名前を付けました．

![az-mk-swa3](/assets/az-mk-swa3.png)

アプリの名前を入力します．今回は`todo-app`と付けました．次に，ホスティングプランを`Free`にチェックを入れ，Azure Functions APIとステージング環境のリージョンを `East Asia`にします．(まだJapan Eastは無いんですよねぇ...)

![az-mk-swa-3.5](/assets/az-mk-swa3.5.png)

デプロイの詳細を「GitHub」にし，「GitHub アカウント」のところから，GitHubにログインしてください．

「組織」を自分のアカウント名，「リポジトリ」を今回作成したアプリのリポジトリ，「分岐」をmainにします．(環境によってはmaster)

ビルド詳細は，「ビルドのプリセット」を「React」，「アプリの場所」は`/client`，APIの場所を`api`，出力先を`dist`にします．

![az-mk-swa4](/assets/az-mk-swa4.png)

これで「確認及び作成」をクリックし，必要な情報が欠けていないかチェックされ，チェックが完了したら「作成」をクリックして，Static Web Appを作成します．

その後，GitHubの`todo-app`のリポジトリの`Actions`タブを開くと，以下のような項目が追加されています．ここが緑色の✅になっているとアプリそのもののデプロイは終了です．

![github-actions](/assets/github-actions.png)

### Storage Account及びTable Storageの構成

まずStorage Accountの作成をしていきます．

Azure Portalのホーム画面から，`todo-app-resource`(作成したリソースグループ)選択します．

![az-mainmanu](/assets/az-mainmenue.png)

そこから「作成」をクリックして，このリソースグループの中に新しいリソースを作成していきます．

![az-resource-group](/assets/az-resource-group.png)

検索ボックスに「ストレージ アカウント」と入力し，「ストレージ アカウント」から「作成」> 「ストレージ アカウント」をクリックします．

![az-mk-storageaccount1](/assets/az-mk-storageaccount1.png)

ストレージアカウント名を適当に入力し，地域を`(Asia Pacific) Japan East`に設定します．(今考えたらEast Asiaのほうがいいかもしれん...)

パフォーマンスは「Standard」とし，他はそのままで大丈夫です．

そうしたら，「確認及び作成」をクリックします．

![az-mk-storageaccount2](/assets/az-mk-storageaccount2.png)

すると，作成するストレージアカウントの設定情報が表示されます．今回はこのままでいいので，「作成」をクリックします．これでしばらく待てば，ストレージアカウントのデプロイは完了です．

![az-mk-storageaccount3](/assets/az-mk-storageaccount3.png)

次に，Table Storageの構成を行います．

デプロイが完了したStorage Accountのリソースにアクセスし，左の「テーブル」タブから「＋テーブル」をクリックし，`Todo`という名前をつけて「OK」をクリックし，Todoという名前のテーブルを作成します．これでTable Storageの構成は終了です．

![az-mk-table](/assets/az-mk-table.png)

### Static Web AppとStorage Accountの接続

ストレージアカウントの「アクセスキー」タブを開きます．key1の「接続文字列」の欄の「表示」をクリックして，表示された接続文字列をコピーします．

![az-view-connection](/assets/az-view-connection.png)

次に，作成したStatic Web Appのリソースに移動して，「構成」タブの，「＋追加」をクリックします．そこに名前と値を入れる欄があるので，名前を`TodoStorageConnection`にし，値をさっきコピーしてきた文字列を入れて保存します．

この`TodoStorageConnection`は，バックエンドの開発で使った環境変数の名前ですね．こうすることで，ローカル環境で実行する際はAzurite，Azure上の本番環境だとデプロイしたStorage Accountに接続されるようになるという感じです．

この設定が終わると，アプリのデプロイは完了です．

![az-edit-config](/assets/az-edit-config.png)

Static Web Appの概要タブに，URLという項目があるので，そのURLにアクセスすると，公開されたアプリを使うことができます．

### CI/CDについて

今回のデプロイの構成では，GitHub Actionsを使ったCI/CDが有効になっています．CI/CDについて深く言及すると，さらに長くなってしまうので結論から言うと，**GitHubにアプリのコードを`main`ブランチにマージすると，そのアプリが自動でデプロイ先に反映されます．**

なので，アプリを作った後に機能を追加したい場合は，`main`ブランチに書いたコードをマージすれば，Azure側(デプロイ先)でアップデート作業をごちゃごちゃしなくて大丈夫になります．

AzureはGitHub Actionsを使ったCI/CDが簡単に組めるので非常におすすめです．

## おわりに
**ここまで本当にお疲れさまでした．** Webアプリの構成としてはかなり簡易的な設計でしたが，かなり長くなっちゃいました...

ただこれができれば，小さめのWebアプリであれば低コストで公開していられるので，おすすめです．

最後まで読んでくださり，本当にありがとうございました．