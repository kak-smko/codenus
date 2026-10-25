<template>
  <r-container class="pa-0" full-width>
    <r-meta
      title="404 page"
      description="404 page: not found"
      :url="$route.path"
    ></r-meta>
    <r-row class="mt-12">
      <r-col>
        <r-img
          src="/api/storage/img/not-found.png"
          alt="404 page"
          auto-size
          :wPerh="2"
        ></r-img>
      </r-col>
    </r-row>
  </r-container>
</template>

<script>
export default {
  name: "notFound",
  metaInfo: {
    title: "notFound",
  },
};
</script>

<style scoped></style>
