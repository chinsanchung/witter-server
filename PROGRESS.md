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

### 09/24

- Tweet 모델에서 미디어를 이미지와 비디오로 분리했습니다. 이미지는 최대 4개인 배열, 비디오는 하나만 올릴 수 있습니다.
  - 그에 따라 컨트롤러와 서비스의 createTweet 메소드를 수정했습니다.
- 파일을 AWS S3 로 업로드하는 multer, multer-s3, aws-sdk 를 설치하고, 업로드 미들웨어를 작성했습니다.
<!-- - 리트윗, 마음에 들어요 기능을 doTweetAction 메소드로 수행하도록 작성했습니다. 답글 달기와 삭제 기능을 작성했습니다. -->
- 리트윗, 마음에 들어요, 답글 달기 기능을 수행하기 전에 트윗이 존재하는지 또는 삭제하지 않았는지를 확인하는 checkTweetExistence 메소드를 추가했습니다.
- 사용자가 작성한 트윗, 답글을 작성 순으로 저장하는 tweet_list, 마음에 들어요를 저장하는 like_list 를 가진 TimeLine 스키마와 모델을 작성했습니다.

### 09/25

- 타임라인 모델을 추가에 맞춰 트윗 작성과 삭제, 리트윗, 답글 작성과 삭제 기능에 타임라인 데이터와의 연동을 추가했습니다.
  - 또한 doTweetAction 으로 일원화했던 리트윗, 마음에 들어요 기능을 분리했습니다. 타임라인 데이터와의 연동을 추가한만큼 4개로 분리하는 것이 가독성 측면에서 더 좋을 것이라 판단했습니다.
- TimeLine 의 목록 구성을 수정했습니다. 타임라인의 출력을 원할하게 하기 위해 tweet_id 뿐만 아니라 register_date(등록일), is_retweet(리트윗 여부)를 더한 객체 목록으로 변경했습니다.
- reading 서비스 api 를 작성했습니다. 여기에는 특정 트윗 1개와 그에 따른 댓글을 보여주는 기능(getTweets), 특정 사용자의 타임라인(getUserTimeLine), 그리고 로그인한 사용자의 타임라인을 출력하는 기능(getHomeTimeLine)이 있습니다.

### 09/27

### 09/28

- 새로고침으로 클라이언트의 사용자 정보가 삭제됐을 때, 쿠키에 저장했던 session 으로 다시 인증해서 서버로부터 사용자 정보를 가져와 저장하는 token-refresh api 를 작성했습니다.
- README.md 를 프로젝트 개요, 폴더 구조, api 를 설명하는 방식으로 수정했습니다.
- 사용자와 관련된 기능들(팔로워 목록, 필로잉 목록, 이메일 및 아이디 중복 체크, 프로필 수정)을 "api/user" 폴더에 담았습니다. 인터페이스로 UserService 에 대한 개요를 담고, 임시로 컨트롤러를 작성해 라우트에 연결했습니다.

### 09/29

- 사용자 관련 기능 "api/user" 의 컨트롤러, 서비스를 작성했습니다.

### 10/02

- Tweet 스키마 모델에 답글의 대상 트윗의 아이디를 담은 comment_target_id 를 작성하고, 답글을 작성할 때 추가하도록 설정했습니다.
  - 클라이언트의 트윗 상세보기에서, 답글일 경우 상단에 답글의 대상 트윗이 나타나도록 수정했습니다.
    <!-- comment_target_id?: number; // 답글을 단 대상 트윗의 tweet_id -->
    <!-- comment_target_id: { type: Number }, -->

### 10/03

- getUserTimeLine 변경하기: 트윗 목록뿐만 아니라 해당 사용자의 정보도 응답으로 보내도록 수정했습니다.
- S3 의 무료 기한이 끝나는 것을 고려해서, 사용자의 프로필 사진과 헤더를 제거하고 프로필은 hex 색상 코드로 입력하도록 User 스키마에 profile_color 를 추가했습니다.
- 헤로쿠에 빌드하는 과정에서 아래와 같은 에러가 발생했습니다.

```
Failed at the twitter_clone_server@1.0.0 start script.
This is probably not a problem with npm. There is likely additional logging output above.
```

원인을 검색한 결과 [cross-env is a development dependency. Heroku, by default, only installs production dependencies. That's why it's throwing that error.](https://stackoverflow.com/a/68676440)라는 글를 찾았습니다.

그래서 빌드 전용으로 임시로 process.env.NODE_ENV 조건문을 제거하고 깃에 올렸습니다. Config Vars 에서 .env 에 등록했던 값을 등록했습니다. [출처](https://gompro.postype.com/post/975726)

### 10/04

- 팔로우, 언팔로우 API 의 응답에 변경된 사용자 정보를 보내도록 수정하고, 클라이언트에서 useSWR 으로 비동기적으로 상태를 갱신하도록 했습니다.
- 상세 트윗을 불러올 떄 useSWR 으로 불러오도록 수정하고, 답글의 등록과 동시에 상태를 갱신하도록 했습니다.
- 홈 타임라인을 불러오는 것도 useSWR 으로 수정하고, 트윗의 등록과 동시에 타임라인을 갱신하도록 했습니다.
- 리트윗, 좋아요 기능을 API 와 연결했습니다.
- 홈 타임라인에서 사용한 중복을 제거하는 aggregate 문 일부를 변수로 추출했고, 사용자 페이지의 타임라인 aggregate 쿼리에 추가해 트윗의 중복을 제거하도록 했습니다.
- PORT 설정을 변경하고 클라이언트의 baseURL 을 변경했습니다. heroku 는 dynamic port 를 제공하기 떄문에 빌드 버전의 port 를 고정값으로 하면 안된다고 합니다. [출처](https://stackoverflow.com/a/52992592)
  - 그래서 app.tsx 의 PORT 설정을 `process.env.PORT || 5000;`으로, 클라이언트 defaults.baseURL 을 `/api`으로 수정했습니다.

### 10/15

- 서비스, 컨트롤러의 메소드를 화살표 함수 대신 일반 함수로 변경했습니다.

### 10/16

- REST API 디자인 가이드에 맞게 URI, HTTP 메소드를 재설계하고, 주요 목적에 맞게 몇몇 기능을 옮겼습니다.
  - 도입부 URI 를 복수형 명사로 수정했습니다. 그리고 reading URI 를 timelines 으로 수정했습니다.
  - auth 에 있던 회원가입 기능을 users 로 이전했습니다. 그에 따라 필요가 없어진 auth.interface.ts, auth.service.ts 를 삭제했습니다.
  - timelines(이전에는 reading)에 있던 getTweets 를 tweets 으로 이전하고 이름을 getTweet 으로 바꿨습니다. URI 와 HTTP 메소드를 가이드에 맞게 수정했습니다.
  - tweets 의 모든 기능들의 URI 와 HTTP 메소드를 가이드에 맞게 수정했습니다.
  - users 의 모든 기능들의 URI 와 HTTP 메소드를 가이드에 맞게 수정했습니다.
- API 의 URI, HTTP 메소드의 수정으로 인해 클라이언트의 API 호출 함수도 전부 수정했습니다.

### 10/24

- 무한스크롤 구현작업 시작
  - 타임라인의 쿼리문을 정렬 후 10개씩 제한을 준 다음에야 트윗과 사용자 데이터를 연결시켜 불러오도록 수정했습니다. 그리고 쿼리문 변수의 이름을 수정했습니다.

### 10/30

- app.ts, database.ts, passportConfig.ts 를 core 폴더에 옮겼습니다. 앱, 데이터베이스, 그리고 사용자 인증을 Node.js 서버의 핵심이라고 생각했기 때문입니다.
