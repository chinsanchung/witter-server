# 수행한 작업

그동안 수행한 작업을 정리하는 문서입니다.

- [로그인](##로그인)
- [로그아웃](##로그아웃)

---

## 로그인

### passport-local 대신 직접 로그인 기능을 구현

미들웨어 `passport-local` 대신, [auth.service.ts]()에 직접 로그인을 검증하는 방식으로 수정했습니다. 그동안 세션과 인증 과정을 손쉽게 수행하도록 도와주는 passport 위주로 로그인을 수행했지만, 이번에는 그 과정을 직접 수행하는 것이 목표였기 때문입니다.

이번 로그인은 단계로 진행하고 있습니다.

1. 컨트롤러에서 아이디, 비밀번호 요청 값을 받아 서비스로 전달합니다.
2. 서비스의 `checkLoginValidtionAndReturnUser` 메소드로 아이디의 존재 여부와 비밀번호의 일치 여부를 검증합니다. 검증이 완료되면 TypeORM 으로 조회한 유저 데이터를 리턴합니다.
3. 서비스의 `login` 메소드에서 JWT 토큰을 생성합니다. 엑세스 토큰, 리프레시 토큰 두 개를 생성하며 각각 1시간, 7일의 만료일을 가집니다.
4. 컨트롤러로 돌아와서, 엑세스 토큰은 응답으로 보내어 클라이언트 측이 Header Authorization 에 추가하도록 하고, 리프레시 토큰은 서버 측에서 쿠키로 저장하도록 설정하여 기능을 완료합니다.

### JWT 토큰

가존에는 `express-session`을 이용하여 세션 쿠키를 만들어 관리했습니다. 이번에는 세션 대신 JSON Web Token 을 발급하여 인증을 수행합니다. 데이터베이스에 세션을 저장하고 관리하는 대신, JWT 으로 유효성을 검증하고 필요한 정보를 불러올 수 있어 상대적으로 서버의 자원을 아낄 수 있기에 이 방법을 선택했습니다.

#### JWT 의 특징

JWT 는 세 부분으로 구성되어 있습니다.

- 헤더: 토큰의 종류, 해시 알고리즘에 대한 정보를 담고 있습니다.
- 페이로드: 토큰의 내용물을 인코딩한 부분입니다.
- 시그니처: 헤더의 인코딩 값과 페이로드의 인코딩 값을 합친 후, 비밀 키로 암호화해 만든 문자열으로, 토큰의 변조 여부를 확인합니다.

주의할 점은 JWT 는 외부에서 페이로드의 내용을 읽을 수 있기에, 노출해도 되는 정보만을 담아야 하는 것입니다. (JWT 검증의 주요 목표는 내용물이 바뀌었는지 여부를 확인하는 것입니다.) witter_server 에서는 유저의 아이디 `user_id`를 페이로드로 저장하고 있습니다.

#### JWT 토큰의 저장 방식

엑세스 토큰은 헤더의 Authorization 으로, 리프레시 토큰은 쿠키로 저장하고 있습니다. `httpOnly` 설정으로 외부에서 자바스크립트로 쿠키를 탈취하는 cross site scripting(XSS)를 막고, https 를 사용하는 배포 환경일 때 `secure` 설정을 활성화하여 안전하지 않은 사이트(http)의 통신에서는 쿠키를 전송하지 않도록 합니다. 마지막으로 만료 시간을 설정하여 그 시간이 끝나면 리프레시 토큰 쿠키를 삭제하도록 했습니다.

### 테스트를 위한 가짜 Response 생성하기

서버에서 cookie-parser 를 이용해 쿠키를 생성하면서, Express 의 Response 객체를 사용했습니다. 그 대신 테스트 케이스의 인자 값에 아이디와 비밀번호가 담긴 `loginInput` 이외에도 Response 를 추가해야 했습니다. 다양한 속성, 메소드가 담긴 가짜 Request, Response 객체를 쉽게 만들어주는 [node-mocks-http](https://www.npmjs.com/package/node-mocks-http)을 사용했습니다.

```typescript
import * as httpMocks from 'node-mocks-http';

const mockResponse = httpMocks.createResponse();

it('성공 - 토큰 발급', async () => {
  const loginOutput = {
    accessToken: 'signed-token',
    refreshToken: 'signed-token',
  };
  jest
    .spyOn(service, 'checkLoginValidtionAndReturnUser')
    .mockResolvedValue({ ok: true });
  jest.spyOn(service, 'login').mockResolvedValue({
    ok: true,
    data: loginOutput,
  });

  const result = await controller.login(mockResponse, loginInput);

  expect(result).toEqual({ accessToken: loginOutput.accessToken });
});
```

## 로그아웃

로그아웃은 Response 객체의 `clearCookie`를 이용해 리프레시 토큰을 제거합니다. 엑세스 토큰은 클라이언트 측에서 Authorization Bearer Token 을 제거해 로그아웃을 하는 것으로 가정하고 있습니다.

```typescript
@Post('/logout')
logout(@Res({ passthrough: true }) response: Response): string {
  response.clearCookie('refresh-token');
  return '로그아웃을 완료했습니다.';
}
```
