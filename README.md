# App Info

## 환경 구성

-   node v20.11.1
    -   https://nodejs.org/en/blog/release/v20.11.1
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

    1. 기본 실행 명령어

        - npx expo start
        - npx expo start --tunnel : 모바일&PC가 다른 네트워크를 사용해야 하는 경우 ngrok을 통한 proxy 자동 설정

    2. expo go 에서 실행하고 싶은 경우

        - expo-dev-client 삭제 ( "expo-dev-client": "~3.3.10",)
        - npm start (or npx expo start)

    3. development 실행 (권장)

        - npm run prebuild (native 라이브러리 설치한 경우)
        - npm run configure
        - npm run build:dev
        - expo.dev 에서 build 확인 및 .apk 파일 install
        - npm run dev (--dev-client 로 실행)

    4. eas build 전에 프로젝트 오류 검사

        - npx -y expo-doctor

## 프로젝트 배포

1. android

    - npm run build:prod
    - npm run build:sta # 개발 서버 주소로 배포

2. ios

    - npm run build:ios:prod
    - npm run build:ios:sta # 개발 서버 주소로 배포

3. expo.dev 에서 .apk, .ipa 다운로드

## 업데이트

1. expo-updates

    - 반영이 안되는 경우
        - native code 변경 시 (expo 에서는 해당 안됨)
        - 큰 데이터 파일
        - 운영체제 버전 변경
        - 프로젝트 구조 변경
        - 외부 라이브러리, SDK 주요 버전 업그레이드

2. ios provision 파일 변경
    - npm run credentials
    - IOS > select profile > Build Credentials: Manage everything needed to build your project > Provisioning Profile: Delete one from your project
        - apple developer 에서 삭제되는게 아니고, expo 에 등록된 파일이 삭제되므로 걱정x

## device 설정

    - web : webview 지원이 안됨
    - android, ios expo go APP
        - PC와 mobile이 같은 네트워크에 접속되어 있어야 함
        - 앱스토어에서 다운로드 -> QR 또는 링크를 통해 접속
        - android : Expo
        - ios : Expo Go
    - mobile USB 연결

## 이슈

-   expo-cli를 통해 만들어졌지만 추가 기능에 따라 react native cli로 변경 가능성 있음 => eject 참고

## 구조

-   .vscode : vsCode용 prettier, eslint 설정 파일
-   app.json : expo 프로젝트 설정 파일
-   babel.config.js : react native 용 절대경로 설정 파일
-   eas.json : eas 설정 파일
-   google-services.json : FCM (android) 설정 파일
-   jsconfig.json : vsCode 용 절대경로 설정 파일
-   metro.config.js : svg 설정
-   app
    -   index
    -   \_layout
    -   [link] : 링크 접속 관련
    -   (login) : 로그인 관련
        -   \_layout
        -   bio : 생체 인증
        -   ldap : LDAP 로그인
        -   pin : PIN 로그인
    -   (screens)
        -   \_layout
        -   main : 메인
        -   web : web view
        -   guide : 가이드 페이지
    -   (utils)
        -   \_layout
        -   camera : QR 스캔
        -   error : 오류 페이지
        -   splash : splash 페이지
    -   components
        -   Contents : router 관련
        -   Loading : loading 화면
        -   OtherLogin : 다른 방법으로 로그인
    -   modal
        -   PopModal : 모달 팝업창 (공통)
        -   LoginInfo : LDAP 로그인 페이지 문의 및 연락처
    -   api
        -   Api : axios 설정
        -   ApiFetch : fetch method 설정
        -   ApiService : api method 설정 (사용x)
        -   LoginApi : 로그인 api
    -   assets : 이미지, css 파일
    -   store
        -   store.js
        -   reducers
            -   commonReducer : 공통
            -   loginReducer : 로그인 관련
            -   modalReducer : 모달 관련
    -   utils
    -   BackUtiles : back handler 관련
        -   DispatchUtils : dispatch 관련
        -   ErrorBoundary : error 처리
        -   ImageUtils : 이미지 관련
        -   Push : push 알림 설정 (expo-notification) (사용 x)
        -   PushFcm : push 알림 설정 (firebase-messaging)
        -   Snackbar : snack bar 설정
        -   StorageUtils : async storage 관련
        -   TextUtils : text 관련

## 환경 변수 로드 순서

### eas.json (env) << eas secrets << .env

-   https://docs.expo.dev/build-reference/variables/#setting-plaintext-environment-variables-in-easjson
-   local 에서는 eas.json, eas secrets가 적용되지 않기 때문에 .env에 값을 넣어야 한다. 따라서, .env는 .gitignore할 것
-   .env 에서 사용하는 환경 변수는 'EXPO_PUBLIC' 으로 시작한다.
-   eas secrets에 등록하지 않는 환경 변수는 .env 와 eas.json에 모두 설정한다.

## eas secrets

-   npx eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
-   npx eas secret:create --scope project --name GOOGLE_SERVICES_IOS --type file --value ./GoogleService-Info.plist
-   npx eas secret:push --scope project --env-file .env
-   npx eas secret:create --scope project --name SECRET_NAME --value secretvalue --type string
-   npx eas secret:list # secrets 정보

## push 설정 관련

    - 색상
        - android : was > androidconfig.color
    - icon
        - android
            - foreground : app.json > plugins > expo-notifications > icon (by expo-notifications)
            - background : app.json > notification (by firebase messaging)
            - prebuild 시 : app.json > notification
        - ios
            - app icon

## ip가 안맞는 경우

-   > powershell (관리자 권한) > setx /M REACT_NATIVE_PACKAGER_HOSTNAME 192.168.7.71 > vsCode 재시작
