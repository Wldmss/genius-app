[ ]

-   [x] 카메라 관련 assets 정리
-   [ ] foreground push 개발 - 사용할 일이 있다면 firebase로 변경 > 모달 개발
-   [ ] react-native-firebase/messaging 빼기 (APNs까지 하고 지우자)
-   [ ] APNs 연결
    -   [ ] ios 개발자 계정이 필요할까?
-   [ ] FCM/APNs 모듈 구축
    -   [ ] OAUTH2 토큰 발급 로직 (FCM)
        -   https://developers.google.com/oauthplayground
        -   https://firebase.google.com/codelabs/use-the-fcm-http-v1-api-with-oauth-2-access-tokens?hl=ko#3
        -   spring boot 프로젝트에?
    -   [ ] PUSH Q => schedule => push send 로직
-   [x] 로그아웃 기능 빼기
-   [x] device push token 로그인 시마다 확인 처리
-   [ ] 강사 lms -> QR생성하기 > 찍으면 출석 처리 onMessage 처리
-   [x] 생체 인증 등록 > 다시시도 > 등록여부 제외 처리
-   [ ] QR 앱 인증, 체크인 구현
-   [ ] 배포 검토
-   [ ] firebase, ios, expo 계정 발급
-   [ ] 화면 디자인 변경

    -   [ ] loading page
    -   [ ] app icon 변경

-   LDAP 인증

    -   WAS url, 파라미터, return 값
    -   로그인 시 비밀번호 만료일이 있는데, 그 값을 WAS 에서 비교해서 해당 값이 변경되었다면 재로그인 처리
