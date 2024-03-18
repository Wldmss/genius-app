[ ]

-   [ ] 카메라 관련 assets 정리
-   [ ] foreground push 개발
-   [ ] APNs 연결
-   [ ] FCM/APNs 모듈 구축
    -   [ ] OAUTH2 토큰 발급 로직 (FCM)
        -   https://developers.google.com/oauthplayground
        -   https://firebase.google.com/codelabs/use-the-fcm-http-v1-api-with-oauth-2-access-tokens?hl=ko#3
    -   [ ] PUSH Q => schedule => push send 로직
-   [ ] 로그아웃 기능 빼기
-   [ ] device push token 로그인 시마다 확인 처리
-   [ ] react-native-firebase/messaging 빼기

-   LDAP 인증

    -   WAS url, 파라미터, return 값
    -   로그인 시 비밀번호 만료일이 있는데, 그 값을 WAS 에서 비교해서 해당 값이 변경되었다면 재로그인 처리

-   화면 디자인 변경
-   영상 전체화면 처리 > id 값 지정 필요
-   FCM 연동 테스트 진행중 -> 서버에서 key 받고 쏘는거, pushQ 관련
-   APNs 연동 테스트 > 그 전에 ios 개발자 계정이 필요한 것 같음.
-   QR 앱 인증, 체크인 구현
-   배포 검토
-   firebase, ios, expo 계정 발급

"expo-dev-client": "~3.3.9",

-   WBS 날짜 정해서 수정하기
    4월 부터 웹/디자인 지원이 가능하다고 해서.. 그때부터
    5월 정도에는.. 끝나고, 심사 뭐 그렇대

강사 lms -> QR생성하기 > 찍으면 출석 처리
