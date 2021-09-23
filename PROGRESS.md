# 작업 진도

그동안 수행해온 작업들을 작성합니다.

### 09/21

- 데이터베이스 연결, express app 의 미들웨어 연결, 그리고 app 을 클래스 형태로 변경. debug 패키지로 서버의 로그를 출력하도록 설정했습니다.
- 사용자 데이터 스키마를 작성했습니다.
- Redis 클라우드 가입, express app 에 연결했습니다.

### 09/22

- passport, passport-local 설치, 로그인 관련 설정을 진행했습니다.
- User 모델의 스키마에 follower, following 을 추가했습니다.
- 회원가입, 로그인, 로그아웃, 탈퇴 처리를 맡을 api/auth 폴더를 생성했습니다..
  - 컨트롤러, 서비스, 레포지토리로 구분하는 작업 시작 (this.authService 를 인식하지 못하는 문제: 화살표 함수로 수정해서 this 의 값을 찾도록 수정했습니다.)

### 09/23

- 회원가입 기능 작업: 사용자 정보를 req.body 객체에 넣어 보내기, 비밀번호 암호화, 데이터베이스에 사용자 생성을 진행했습니다.
- 로그인, 로그아웃 기능을 작성했습니다.
- User 모델의 스키마에 description(자기소개), header(헤더), photo(프로필 사진), lock_status(공개 여부) 를 추가했습니다.
- 트윗 생성하기와 is_active 를 false 로 바꿔 트윗을 삭제하는 기능을 작성했습니다.
- 지금까지의 api 에러 처리를 [http-errors](https://www.npmjs.com/package/http-errors) 패키지로 처리하도록 변경했습니다.
