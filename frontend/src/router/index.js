import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import HomePage from "@/views/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";

Vue.use(VueRouter);

// ルート定義
const routes = [
  {
    path: "/",
    component: HomePage,
    // ログインが必要な画面には「requiresAuth」フラグを付けておく
    meta: { requiresAuth: true }
  },
  {
    path: "/login",
    component: LoginPage
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/"
  }
];

// ルータインスタンスを作成
const router = new VueRouter({
  mode: "history",
  routes
});

/**
 * 画面遷移をする直前に毎回実行されるナビゲーションガード
 */
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.state.auth.isLoggedIn;
  const token = localStorage.getItem("access");
  console.log("to.path=", to.path);
  console.log("isLoggedIn=", isLoggedIn);

  // ログインが必要な画面に遷移しようとした場合
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // ログインしていない場合
    if (!isLoggedIn) {
      console.log("User is not logged in.");
      // まだ認証用トークンが残っていればユーザー情報を再取得
      if (token != null) {
        console.log("Try to renew user info.");
        store
          .dispatch("auth/renew")
          .then(() => {
            // 再取得できたらそのまま次へ
            console.log("Succeeded to renew. So, free to next.");
            next();
          })
          .catch(() => {
            // 再取得できなければログイン画面へ
            forceToLoginPage(to);
          });
      } else {
        // 認証用トークンが無い場合は、ログイン画面へ
        forceToLoginPage(to);
      }
    } else {
      // ログインしている場合はそのまま次へ
      console.log("User is already logged in. So, free to next.");
      next();
    }
  } else {
    // ログインが不要な画面であればそのまま次へ
    console.log("Go to public page.");
    next();
  }
});

/**
 * ログイン画面へ強制送還
 */
function forceToLoginPage(to) {
  console.log("Force to login page.");
  router.replace({
    path: "/login",
    // 遷移先のURLはクエリ文字列として付加
    query: { next: to.fullPath }
  });
}

export default router;
