# 지니어스 모바일

## 환경 구성

-   node v16.20.1
    -   https://nodejs.org/en/blog/release/v16.20.1
-   expo-cli
-   prettier, eslint 설정
    -   Prettier ESLint, Prettier - Code formatter 설치 (vsCode extensions)
    -   vsCode Settings > Editor:Format on Save 체크, Editor:Default Formatter - Prettier ESLint 설정
-   babel 절대경로
    -   babel.config.js 참고

## 환경 설정

1. npm install

2. expo cli 설치

    1. npm install -g expo-cli
    2. audit 오류 발생 시
        - npm init -y : package.json 파일 생성
        - npm i --package-lock-only : package-lock.json 파일 생성
        - npm audit
        - npm update

3. eas cli 세팅

    1. npm install -g eas-cli
    2. 로그인
        - npx eas login
    3. expo.dev 에 프로젝트 생성
    4. 프로젝트 연결
        - npx eas init --id [프로젝트 key]
    5. configure build
        - npx eas build:configure
    6. 프로젝트 build
        - npx eas build -p android --profile preview

## expo 환경 설정

1. expo 회원 가입

    - expo.dev
    - 계정 생성

2. expo 로그인
    - npx expo login (PC terminal에서 실행)
    - 개발 환경 (PC) 에서 로그인, expo 앱에서 로그인 시 연동됨

## 프로젝트 실행

1.  원하는 명령어로 프로젝트 실행

    -   npx expo start
    -   npx expo start --tunnel : 모바일&PC가 다른 네트워크를 사용해야 하는 경우 ngrok을 통한 proxy 자동 설정
    -   npm start

2.  device 설정
    -   web : webview 지원이 안됨
    -   android, ios expo go APP
        -   PC와 mobile이 같은 네트워크에 접속되어 있어야 함
        -   앱스토어에서 다운로드 -> QR 또는 링크를 통해 접속
        -   android : Expo
        -   ios : Expo Go
    -   mobile USB 연결

## 이슈

    - expo-cli를 통해 만들어졌지만 추가 기능에 따라 react native cli로 변경 가능성 있음 => eject 참고

## 구조

-   .vscode : vsCode용 prettier, eslint 설정 파일
-   jsconfig.json : vsCode 용 절대경로 설정 파일
-   babel.config.js : react native 용 절대경로 설정 파일
-   metro.config.js : svg 설정
-   src
    -   api
        -   Api.js : axios 설정
        -   ApiService.js : api method 설정
        -   LoginApi.js : 로그인 api
    -   assets : 이미지, css 파일
    -   components
        -   BioLogin.js
        -   LDAPLogin.js
        -   LoginLayout.js
        -   OtherLogin.js
        -   PinLogin.js
    -   modal
        -   PopModal.js : 모달 팝업창 (공통)
        -   LoginInfo.js : LDAP 로그인 페이지 문의 및 연락처
    -   navigation
        -   Navigation.js : 네비게이션 설정
    -   screens
        -   Main.js : genius 메인 페이지
        -   WebViewScreen.js : genius webview
    -   store
        -   store.js
        -   reducers
            -   loginReducer.js : 로그인 관련
            -   modalReducer.js : 모달 관련
    -   utils
        -   NavigationUtils.js : navigation 공통화
        -   StorageUtils.js : async storage 공통화
        -   Utils.js : 공통 메소드
