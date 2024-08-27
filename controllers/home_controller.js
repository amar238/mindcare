



module.exports.home = async (req,res)=>{
    try {
        return res.render('index');
    } catch (error) {
        console.log('Error', error);
        return;
    }
}