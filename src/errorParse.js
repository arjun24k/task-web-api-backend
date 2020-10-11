const errorParse = (error) => ({
    "name":error.name,
    "error":error.message
});

module.exports={
    errorParse
}